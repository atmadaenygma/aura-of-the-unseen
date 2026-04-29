import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { readNPCSpawns } from '../utils/readNPCSpawns';
import { Character } from './Character';
import { NPC } from './NPC';
import { DebugOverlay } from './DebugOverlay';
import { DialogueSystem } from './DialogueSystem';

/**
 * AURA OF THE UNSEEN: MASTER STAGE ENGINE v4.5
 * Features: Sensory Telemetry, Proximity Hitboxes, Quad-Mask Logic.
 */
export const Stage = ({ locationID, manifest, gameState, setGameState, debugMode }) => {
  const ZOOM = 1.6;

  // -- UI & NARRATIVE STATES --
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [activeBark,     setActiveBark]     = useState({ id: null, text: '' });
  const [nearbyEntity,   setNearbyEntity]   = useState(null);
  const [playerCoords,   setPlayerCoords]   = useState({ x: 640, y: 550 });
  const [currentTelemetry, setCurrentTelemetry] = useState(null);

  // Ref for entity ID comparison — prevents 60fps setState when entity hasn't changed.
  // This is the primary performance gate: Stage only re-renders when the entity
  // the player is near actually changes, not on every frame.
  const nearbyEntityIdRef = useRef(null);

  // Terrain surface tracking — only dispatches to gameState when surface changes.
  // Drives footstep audio and future surface-based modifiers.
  const currentTerrainRef = useRef(null);

  // NPC spawns read from mask_npcs.png.
  // Overrides spawnX/spawnY in the manifest so placement is done visually in Photoshop.
  // Falls back to manifest coordinates if the mask is missing or a color has no pixel.
  const [resolvedNPCs, setResolvedNPCs] = useState(manifest.npcs || {});

  // mask_npcs.png overrides disabled — manifest coordinates are authoritative
  // useEffect(() => {
  //   readNPCSpawns(`${manifest.path}/mask_npcs.png`, 1280, 800).then(spawns => {
  //     if (Object.keys(spawns).length === 0) return;
  //     setResolvedNPCs(prev => {
  //       const merged = { ...prev };
  //       Object.entries(merged).forEach(([colorKey, npc]) => {
  //         if (spawns[colorKey]) {
  //           merged[colorKey] = { ...npc, spawnX: spawns[colorKey].x, spawnY: spawns[colorKey].y };
  //         }
  //       });
  //       return merged;
  //     });
  //   });
  // }, [manifest.path]);

  // 1. SENSORY HOOK (Quad-Mask Synchronization)
  const { checkPixel, isReady } = useNavigation(
    `${manifest.path}/mask_logic.png`,
    `${manifest.path}/mask_entities.png`,
    `${manifest.path}/mask_hiding.png`,
    `${manifest.path}/mask_terrain.png`
  );

  // Stable collision function passed to Character.
  // useCallback([checkPixel]) means this stabilizes after masks load (isReady → true).
  // Without this, an anonymous (x,y) => ... lambda would be a new reference every
  // Stage render, causing Character's checkCollisionRef update and potential loop churn.
  const checkCollision = useCallback(
    (x, y) => checkPixel(x, y, 1280, 800),
    [checkPixel]
  );

  // 2. DETECTION LOGIC — called 60fps from Character's rAF loop via onNearbyEntityRef.
  // useCallback([manifest, debugMode, setGameState]) ensures Character's ref stays
  // current when room or debug mode changes, without destabilizing the game loop.
  const handleEntityDetection = useCallback((navData, currentPos) => {
    // Telemetry (debug only — no cost in production)
    if (debugMode) {
      setCurrentTelemetry(navData);
    }

    if (navData.type === 'EXIT') {
      setGameState(prev => ({ ...prev, currentRoom: manifest.exitTo }));
      return;
    }

    // Compute nearest interactive entity
    let found = null;

    // A. NPC PROXIMITY CHECK (Priority over mask)
    // Uses resolvedNPCs so mask_npcs.png positions are respected
    const closestNPC = Object.values(resolvedNPCs).find(npc => {
      const dist = Math.hypot(currentPos.x - npc.spawnX, currentPos.y - npc.spawnY);
      return dist < 80;
    });

    if (closestNPC) {
      found = { ...closestNPC, logicType: 'NPC' };
    } else if (navData.type === 'INTERACT') {
      // B. GREEN MASK — searchable / readable objects
      const data = manifest.entities[navData.entityKey];
      if (data) found = { ...data, logicType: 'ARTIFACT', id: navData.entityKey };
    } else if (navData.type === 'HIDE_ZONE') {
      // C. PURPLE MASK — hiding spots
      const data = manifest.hidingSpots[navData.hideKey];
      if (data) found = { ...data, logicType: 'HIDE', id: navData.hideKey };
    }

    const newId  = found?.id ?? null;
    const prevId = nearbyEntityIdRef.current;

    // KEY GATE: Only commit to React state when the entity actually changes.
    // This stops the cycle: every frame while moving → nearbyEntity re-set → Stage re-renders.
    if (newId !== prevId) {
      nearbyEntityIdRef.current = newId;
      setNearbyEntity(found);

      if (found?.logicType === 'NPC') {
        setGameState(p => ({ ...p, nearbyNPC: found }));
      } else if (prevId !== null) {
        // Leaving NPC proximity — clear the nearbyNPC reference
        setGameState(p => ({ ...p, nearbyNPC: null }));
      }
    }

    // In debug mode: always update coords so the crosshair follows Maya continuously.
    // In production: only update when a prompt is visible (avoids 60fps re-renders).
    if (debugMode || found !== null) {
      setPlayerCoords({ x: currentPos.x, y: currentPos.y });
    }

    // Terrain surface tracking — only updates gameState when Maya crosses a surface boundary.
    // This is the hook point for footstep audio and speed modifiers.
    // mask_terrain.png currently reads all floor as "255,255,255" (wood floor default).
    // Paint distinct color zones on the mask and add entries to manifest.terrainSurfaces
    // to differentiate surfaces (carpet, grass, mud, etc.).
    if (navData.terrain && navData.terrain !== currentTerrainRef.current) {
      currentTerrainRef.current = navData.terrain;
      const surface = manifest.terrainSurfaces?.[navData.terrain];
      if (surface) {
        setGameState(p => ({ ...p, currentTerrain: surface }));
      }
    }
  }, [manifest, resolvedNPCs, debugMode, setGameState]);

  // 3. THE ACTION ACTUATOR — [E] Talk/Search, [C] Hide
  const triggerInteraction = useCallback((key) => {
    if (!nearbyEntity) return;

    if (key === 'E') {
      if (nearbyEntity.logicType === 'NPC') {
        if (nearbyEntity.dialogueKey) {
          setActiveDialogue(nearbyEntity.dialogueKey);
        } else if (nearbyEntity.barks) {
          const b = nearbyEntity.barks[Math.floor(Math.random() * nearbyEntity.barks.length)];
          setActiveBark({ id: nearbyEntity.id, text: b });
          setTimeout(() => setActiveBark({ id: null, text: '' }), 3000);
        }
      } else if (nearbyEntity.logicType === 'ARTIFACT') {
        setActiveArtifact(nearbyEntity);
        if (nearbyEntity.type === 'JOURNAL') {
          setGameState(p => ({
            ...p,
            memories:  [...p.memories, { title: nearbyEntity.name, content: nearbyEntity.text }],
            integrity: Math.max(0, p.integrity + (nearbyEntity.impact || 0)),
          }));
        }
      }
    }

    if (key === 'C' && nearbyEntity.logicType === 'HIDE') {
      setGameState(p => ({ ...p, isMayaHidden: !p.isMayaHidden }));
    }
  }, [nearbyEntity, setGameState]);

  if (!isReady) return (
    <div style={{ color: '#d4af37', padding: '100px', fontFamily: 'serif', letterSpacing: '4px' }}>
      ESTABLISHING NEUROMIMETIC LINK...
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>

      <div
        id="world-container"
        style={{ position: 'absolute', width: 1280 * ZOOM, height: 800 * ZOOM, willChange: 'transform' }}
      >
        <DebugOverlay
          pos={playerCoords}
          manifest={manifest}
          active={debugMode}
          zoom={ZOOM}
          telemetry={currentTelemetry}
        />

        <img
          src={`${manifest.path}/base.jpg`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          alt=""
        />

        {/* NPCs — positions resolved from mask_npcs.png, falling back to manifest coords */}
        {Object.values(resolvedNPCs).map(npc => (
          <NPC
            key={npc.id}
            {...npc}
            zoom={ZOOM}
            activeBark={activeBark.id === npc.id ? activeBark.text : null}
          />
        ))}

        <Character
          initialPos={{ x: 640, y: 550 }}
          zoom={ZOOM}
          gameState={gameState}
          setGameState={setGameState}
          checkCollision={checkCollision}
          onNearbyEntity={handleEntityDetection}
          onInteract={triggerInteraction}
          activeUI={activeArtifact || activeDialogue}
        />

        {/* DEPTH OVERLAYS */}
        {manifest.overlays && manifest.overlays.map(ov => (
          <img
            key={ov.id}
            src={`${manifest.path}/${ov.filename}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: ov.yDepth, pointerEvents: 'none' }}
            alt=""
          />
        ))}

        {/* INTERACTION PROMPT */}
        {nearbyEntity && nearbyEntity.name && !activeArtifact && !activeDialogue && (
          <div style={{
            position: 'absolute',
            left: playerCoords.x * ZOOM,
            top: (playerCoords.y - 180) * ZOOM,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            textAlign: 'center',
          }}>
            <div style={{
              background: '#d4af37', color: '#000', padding: '8px 16px',
              fontSize: 12, fontWeight: 'bold', fontFamily: 'serif',
              border: '1px solid #000', boxShadow: '0 10px 20px black',
            }}>
              {nearbyEntity.logicType === 'HIDE'
                ? '[C] HIDE'
                : `[E] ${nearbyEntity.name.toUpperCase()}`}
            </div>
          </div>
        )}
      </div>

      {activeDialogue && (
        <DialogueSystem
          dialogueKey={activeDialogue}
          gameState={gameState}
          setGameState={setGameState}
          onExit={() => setActiveDialogue(null)}
        />
      )}
    </div>
  );
};
