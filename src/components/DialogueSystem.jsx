import React, { useState, useEffect, useRef } from 'react';
import { DIALOGUE_DATA } from '../data/dialogue';
import { DiceCheck } from './DiceCheck';
import { useTextScale } from '../context/TextScaleContext';

// Map a speaker name to their portrait path.
// Returns null (not a broken fallback) if no portrait exists —
// the portrait slot simply renders nothing, which is correct for
// future NPCs without a portrait asset yet.
const resolvePortrait = (speaker) => {
  if (!speaker) return null;
  const slug = speaker
    .toLowerCase()
    .replace(/^old /, '')  // "Old Silas" → "silas"
    .replace(/^the /, '')  // "The Overseer" → "overseer"
    .replace(/\s+/g, '_'); // spaces → underscores
  return `/ui/portraits/${slug}_portrait.png`;
};

export const DialogueSystem = ({ dialogueKey, gameState, setGameState, onExit }) => {
  const [currentNode, setCurrentNode] = useState(() => DIALOGUE_DATA[dialogueKey]);
  const [history,     setHistory]     = useState([]);
  const [activeCheck, setActiveCheck] = useState(null);
  const [showDice,    setShowDice]    = useState(false);
  const [npcPortraitError, setNpcPortraitError] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  const scrollRef    = useRef(null);
  const gpPrevRef    = useRef([]);
  const processRef   = useRef(null); // stable ref to processChoice so rAF loop stays fresh

  // Auto-scroll to bottom on every ledger change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentNode, showDice]);

  // Reset portrait error state when speaker changes
  useEffect(() => {
    setNpcPortraitError(false);
  }, [currentNode?.speaker]);

  // Track seen facets in persistent gameState
  useEffect(() => {
    const facet = currentNode?.facet;
    if (!facet) return;
    setGameState(p => {
      const seen = p.seenFacets || [];
      if (seen.includes(facet)) return p;
      return { ...p, seenFacets: [...seen, facet] };
    });
  }, [currentNode?.facet, setGameState]);

  // Visible options — same filter applied in render so keyboard/gamepad and buttons stay in sync
  const getVisibleOptions = () => {
    if (!currentNode?.options) return [];
    return currentNode.options.filter(opt => {
      if (opt.requireItem   && !(gameState.inventory || []).some(it => it?.id === opt.requireItem)) return false;
      if (opt.requireFlag   && !gameState.flags?.[opt.requireFlag])   return false;
      if (opt.requireNoFlag &&  gameState.flags?.[opt.requireNoFlag]) return false;
      return true;
    });
  };

  // Reset selection when the node changes
  useEffect(() => { setSelectedOption(0); }, [currentNode]);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (showDice) return;
      const opts = getVisibleOptions();
      if (!opts.length) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedOption(i => (i - 1 + opts.length) % opts.length);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedOption(i => (i + 1) % opts.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        processRef.current(opts[selectedOption]);
      } else {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= opts.length) processRef.current(opts[n - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDice, selectedOption, currentNode, gameState.inventory, gameState.flags]);

  // ── Gamepad navigation (rAF polling — only active while dialogue is open) ──
  useEffect(() => {
    if (showDice) return;
    let frame;
    const loop = () => {
      const pads  = navigator.getGamepads ? navigator.getGamepads() : [];
      let gp = null;
      for (let i = 0; i < pads.length; i++) { if (pads[i]?.mapping === 'standard') { gp = pads[i]; break; } }
      if (!gp) { for (let i = 0; i < pads.length; i++) { if (pads[i]) { gp = pads[i]; break; } } }

      if (gp) {
        const prev        = gpPrevRef.current;
        const btnDown     = (idx) => !!(gp.buttons[idx]?.pressed) || (gp.buttons[idx]?.value ?? 0) > 0.5;
        const justPressed = (idx) => btnDown(idx) && !prev[idx];

        const opts = getVisibleOptions();
        if (opts.length) {
          // D-pad up / left stick up
          if (justPressed(12) || (gp.axes[1] < -0.5 && !(prev._ly < -0.5))) {
            setSelectedOption(i => (i - 1 + opts.length) % opts.length);
          }
          // D-pad down / left stick down
          if (justPressed(13) || (gp.axes[1] > 0.5 && !(prev._ly > 0.5))) {
            setSelectedOption(i => (i + 1) % opts.length);
          }
          // A / Cross → confirm
          if (justPressed(0)) {
            setSelectedOption(cur => { processRef.current(opts[cur]); return cur; });
          }
        }

        gpPrevRef.current = Array.from(gp.buttons).map(b => !!(b?.pressed) || (b?.value ?? 0) > 0.5);
        gpPrevRef.current._ly = gp.axes[1]; // store axis for edge detection
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [showDice, currentNode, gameState.inventory, gameState.flags]);

  const processChoice = (choice) => {
    // Commit current node to history before advancing
    setHistory(prev => [...prev, {
      speaker:       currentNode.speaker,
      text:          currentNode.text,
      side:          currentNode.side,
      introspection: currentNode.introspection,
      facet:         currentNode.facet,
      chosenOption:  choice.text,
    }]);

    // If this choice requires a skill check, hand off to DiceCheck
    if (choice.check) {
      setActiveCheck(choice);
      setShowDice(true);
      return;
    }

    // Apply any state mutations from this choice
    const updates = { ...gameState };
    if (choice.flagTrigger) updates.flags          = { ...updates.flags, [choice.flagTrigger]: true };
    if (choice.impact)      updates.morphStability = Math.max(0, updates.morphStability + choice.impact);
    if (choice.rewardMoney) updates.money         += choice.rewardMoney;
    // takeItem — remove a specific item id from inventory when the choice is made
    if (choice.takeItem) {
      const inv = Array.from({ length: 20 }, (_, i) => (updates.inventory || [])[i] ?? null);
      const idx = inv.findIndex(it => it?.id === choice.takeItem);
      if (idx !== -1) inv[idx] = null;
      updates.inventory = inv;
    }
    // clearStolen — remove all items with origin === 'stolen' (anchors + their __ref covers)
    if (choice.clearStolen) {
      const inv = Array.from({ length: 20 }, (_, i) => (updates.inventory || [])[i] ?? null);
      const stolenAnchors = new Set();
      inv.forEach((slot, i) => {
        if (slot && slot.__ref === undefined && slot.origin === 'stolen') stolenAnchors.add(i);
      });
      inv.forEach((slot, i) => {
        if (!slot) return;
        if (stolenAnchors.has(i)) { inv[i] = null; return; }
        if (slot.__ref !== undefined && stolenAnchors.has(slot.__ref)) inv[i] = null;
      });
      updates.inventory = inv;
    }
    setGameState(updates);

    if (choice.next) setCurrentNode(DIALOGUE_DATA[choice.next]);
    else onExit();
  };

  // Keep the ref current after every render so rAF loop always calls the latest version
  processRef.current = processChoice;

  const onDiceComplete = (success) => {
    const resultKey = success ? activeCheck.success : activeCheck.failure;
    setShowDice(false);
    setActiveCheck(null);
    setCurrentNode(DIALOGUE_DATA[resultKey]);
  };

  const zoom = useTextScale();

  if (!currentNode) return null;

  const npcPortraitSrc = resolvePortrait(currentNode.speaker);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(7px)', overflow: 'hidden',
    }}>

      {/* 1. THE SCROLLABLE CENTERED LEDGER */}
      <div
        ref={scrollRef}
        className="ledger-scroll-container"
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '450px', height: '650px', background: '#fff', border: '8px double #000',
          padding: '40px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8)', zIndex: 10,
          overflowY: 'auto', scrollBehavior: 'smooth',
          zoom,
        }}
      >
        {/* HISTORY — faded record of previous exchanges */}
        {history.map((record, idx) => (
          <div key={`hist-${idx}`} style={{ marginBottom: '40px', opacity: 0.5, borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            {record.facet && (
              <img
                src={`/ui/concious_thoughts/${record.facet}.png`}
                style={{ width: '100%', height: 'auto', opacity: 0.4, marginBottom: '10px' }}
                alt=""
              />
            )}
            <div style={{ textAlign: record.side === 'left' ? 'left' : 'right', color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {record.speaker}
            </div>
            <div style={{ textAlign: record.side === 'left' ? 'left' : 'right', color: '#444', fontSize: '16px', fontFamily: 'serif', fontStyle: 'italic' }}>
              "{record.text}"
            </div>
            <div style={{ textAlign: 'left', color: '#000', fontSize: '13px', marginTop: '10px', fontWeight: 'bold' }}>
              Maya: "{record.chosenOption}"
            </div>
          </div>
        ))}

        {!showDice ? (
          <div style={{ minHeight: '100%' }}>
            {/* SPEAKER HEADER */}
            <div style={{
              textAlign: currentNode.side === 'left' ? 'left' : 'right',
              color: '#000', fontSize: '13px', fontWeight: '900', letterSpacing: '5px',
              marginBottom: '20px', borderBottom: '3px solid #000', paddingBottom: '10px',
            }}>
              {currentNode.speaker.toUpperCase()}
            </div>

            {/* DIALOGUE TEXT */}
            <div style={{
              textAlign: currentNode.side === 'left' ? 'left' : 'right',
              color: '#000', fontSize: '21px', fontFamily: 'serif',
              lineHeight: '1.4', marginBottom: '30px', fontWeight: '600',
            }}>
              "{currentNode.text}"
            </div>

            {/* NEUROLOGICAL FACET BANNER */}
            {currentNode.introspection && (
              <div style={{
                position: 'relative', background: '#f0fafa',
                padding: '0px 0px 25px 0px', border: '1px solid #00808033',
                marginBottom: '40px', overflow: 'hidden',
              }}>
                {currentNode.facet && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                      src={`/ui/concious_thoughts/${currentNode.facet}.png`}
                      style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '15px' }}
                      alt="Neurological Facet"
                      onError={(e) => {
                        console.error(`MISSING ASSET: /ui/concious_thoughts/${currentNode.facet}.png`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span style={{
                      color: '#008080', fontSize: '12px', fontWeight: '900', letterSpacing: '4px',
                      textTransform: 'uppercase', marginBottom: '15px',
                      borderBottom: '1px solid #00808033', paddingBottom: '5px',
                    }}>
                      {currentNode.facet.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                <div style={{
                  color: '#008080', fontSize: '15px', fontStyle: 'italic',
                  lineHeight: '1.7', opacity: 0.9, textAlign: 'center', padding: '0 25px',
                }}>
                  {currentNode.introspection}
                </div>
              </div>
            )}

            {/* DIALOGUE OPTIONS — keyboard/controller: arrows navigate, Enter/A confirms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
              {getVisibleOptions().map((opt, i) => {
                const highlighted = i === selectedOption;
                return (
                  <button
                    key={i}
                    onClick={() => processChoice(opt)}
                    onMouseEnter={() => setSelectedOption(i)}
                    style={{
                      background: highlighted ? '#000' : 'none',
                      border: '1px solid #000', color: highlighted ? '#fff' : '#000',
                      padding: '12px', textAlign: 'left', cursor: 'pointer',
                      fontFamily: 'serif', fontSize: '15px', fontWeight: '900',
                      transition: 'background 0.1s',
                    }}
                  >
                    {i + 1}. {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', borderTop: '2px solid black', marginTop: '20px' }}>
            <DiceCheck
              skill={activeCheck.check.skill}
              difficulty={activeCheck.check.difficulty}
              onComplete={onDiceComplete}
            />
          </div>
        )}
      </div>

      {/* 2. THE COLOSSAL PORTRAITS — each anchored to the dialogue box centre */}
      {/* Maya — right edge sits 80px inside the dialogue box left edge */}
      <div style={{
        position: 'absolute', bottom: '-20px',
        right: 'calc(50% + 145px)',
        width: '500px',
        pointerEvents: 'none', zIndex: 100,
      }}>
        <img
          src="/ui/portraits/protagonist_portrait.png"
          style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(20px 0 40px rgba(0,0,0,0.8))' }}
          alt="Maya"
        />
      </div>

      {/* NPC — left edge sits 80px inside the dialogue box right edge.
           Height-controlled so wide images (e.g. Overseer 1161px) don't render tiny. */}
      <div style={{
        position: 'absolute', bottom: '-20px',
        left: 'calc(50% + 145px)',
        width: 'auto',
        pointerEvents: 'none', zIndex: 100,
      }}>
        {npcPortraitSrc && !npcPortraitError && (
          <img
            src={npcPortraitSrc}
            style={{ height: '780px', width: 'auto', display: 'block', filter: 'drop-shadow(-20px 0 40px rgba(0,0,0,0.8))' }}
            alt={currentNode.speaker}
            onError={() => setNpcPortraitError(true)}
          />
        )}
      </div>

      <style>{`
        .ledger-scroll-container::-webkit-scrollbar       { width: 6px; }
        .ledger-scroll-container::-webkit-scrollbar-track { background: #f1f1f1; }
        .ledger-scroll-container::-webkit-scrollbar-thumb { background: #000; }
        .ledger-scroll-container::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
};
