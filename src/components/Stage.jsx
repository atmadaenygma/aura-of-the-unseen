import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { Character } from './Character';
import { NPC } from './NPC';
import { DebugOverlay } from './DebugOverlay';
import { DialogueSystem } from './DialogueSystem';

export const Stage = ({ locationID, manifest, gameState, setGameState, debugMode }) => {
  const ZOOM = 1.6;
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [activeBark, setActiveBark] = useState({ id: null, text: "" });
  const [nearbyEntity, setNearbyEntity] = useState(null);
  const [isMayaHidden, setIsMayaHidden] = useState(false);
  const [playerCoords, setPlayerCoords] = useState({ x: 640, y: 550 });

  const { checkPixel, isReady } = useNavigation(
    `${manifest.path}/mask_logic.png`,
    `${manifest.path}/mask_entities.png`,
    `${manifest.path}/mask_hiding.png`,
    `${manifest.path}/mask_terrain.png`
  );

  const handleEntityDetection = (navData, currentPos) => {
    setPlayerCoords({ ...currentPos });
    if (navData.type === 'EXIT') { setGameState(p => ({...p, currentRoom: manifest.exitTo})); return; }

    let found = null;

    // 1. NPC PROXIMITY (High Priority)
    const closestNPC = Object.values(manifest.npcs || {}).find(npc => {
      const dist = Math.sqrt(Math.pow(currentPos.x - npc.spawnX, 2) + Math.pow(currentPos.y - npc.spawnY, 2));
      return dist < 80; // Increased radius for 1.6x zoom
    });

    if (closestNPC) {
      found = { ...closestNPC, logicType: 'NPC' };
    } 
    // 2. MASK-BASED (Items & Hiding)
    else if (navData.type === 'INTERACT') {
      found = manifest.entities[navData.entityKey] ? { ...manifest.entities[navData.entityKey], logicType: 'ARTIFACT' } : null;
    } else if (navData.type === 'HIDE_ZONE') {
      found = manifest.hidingSpots[navData.hideKey] ? { ...manifest.hidingSpots[navData.hideKey], logicType: 'HIDE' } : null;
    }

    setNearbyEntity(found);
    if (found?.logicType === 'NPC') setGameState(p => ({ ...p, nearbyNPC: found }));
  };

  const triggerInteraction = (actionType) => {
    if (!nearbyEntity) return;

    if (actionType === 'E') {
      if (nearbyEntity.logicType === 'NPC') {
        if (nearbyEntity.dialogueKey) setActiveDialogue(nearbyEntity.dialogueKey);
        else if (nearbyEntity.barks) {
          const b = nearbyEntity.barks[Math.floor(Math.random()*nearbyEntity.barks.length)];
          setActiveBark({ id: nearbyEntity.id, text: b });
          setTimeout(() => setActiveBark({ id: null, text: "" }), 3000);
        }
      } else if (nearbyEntity.logicType === 'ARTIFACT') {
        setActiveArtifact(nearbyEntity);
      }
    }

    if (actionType === 'C' && nearbyEntity.logicType === 'HIDE') {
      setIsMayaHidden(prev => !prev);
      console.log(isMayaHidden ? "Maya emerged" : "Maya is HIDDEN");
    }
  };

  if (!isReady) return <div style={{color:'#d4af37', padding:100, fontFamily:'serif'}}>SYNCHRONIZING...</div>;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <div id="world-container" style={{ position: 'absolute', width: 1280 * ZOOM, height: 800 * ZOOM, willChange: 'transform' }}>
        <DebugOverlay pos={playerCoords} manifest={manifest} active={debugMode} zoom={ZOOM} />
        <img src={`${manifest.path}/base.jpg`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        
        {Object.values(manifest.npcs || {}).map(npc => (
          <NPC key={npc.id} {...npc} zoom={ZOOM} activeBark={activeBark.id === npc.id ? activeBark.text : null} />
        ))}

        <Character initialPos={{ x: 640, y: 550 }} zoom={ZOOM} gameState={gameState} setGameState={setGameState} checkCollision={(x,y) => checkPixel(x,y,1280,800)} onNearbyEntity={handleEntityDetection} onInteract={triggerInteraction} activeUI={activeArtifact || activeDialogue} isMayaHidden={isMayaHidden} />

        {manifest.overlays.map(ov => <img key={ov.id} src={`${manifest.path}/${ov.filename}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: ov.yDepth, pointerEvents: 'none' }} />)}

        {/* --- DYNAMIC ALERT UI --- */}
        {nearbyEntity && !activeArtifact && !activeDialogue && (
          <div style={{ position: 'absolute', left: playerCoords.x * ZOOM, top: (playerCoords.y - 180) * ZOOM, transform: 'translateX(-50%)', zIndex: 9999, textAlign: 'center' }}>
            <div style={{ background: '#d4af37', color: '#000', padding: '8px 16px', fontSize: 12, fontWeight: 'bold', fontFamily: 'serif', border: '1px solid #000', boxShadow: '0 10px 20px black' }}>
              {nearbyEntity.logicType === 'HIDE' ? '[C] HIDE: ' : '[E] ' + nearbyEntity.logicType + ': '} 
              {nearbyEntity.name.toUpperCase()}
            </div>
            {nearbyEntity.logicType === 'ARTIFACT' && <div style={{ color: '#fff', fontSize: 9, marginTop: 5, textShadow: '1px 1px 2px black' }}>Press [E] to Scrutinize</div>}
          </div>
        )}
      </div>

      {activeDialogue && <DialogueSystem dialogueKey={activeDialogue} gameState={gameState} setGameState={setGameState} onExit={() => setActiveDialogue(null)} />}
    </div>
  );
};