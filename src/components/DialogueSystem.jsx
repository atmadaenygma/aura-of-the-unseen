import React, { useState, useEffect, useRef } from 'react';
import { DIALOGUE_DATA } from '../data/dialogue';
import { DiceCheck } from './DiceCheck';

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

  const scrollRef = useRef(null);

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
    if (choice.flagTrigger) updates.flags     = { ...updates.flags, [choice.flagTrigger]: true };
    if (choice.impact)      updates.integrity = Math.max(0, updates.integrity + choice.impact);
    if (choice.rewardMoney) updates.money    += choice.rewardMoney;
    // takeItem — remove a specific item id from inventory when the choice is made
    if (choice.takeItem) {
      const inv = Array.from({ length: 20 }, (_, i) => (updates.inventory || [])[i] ?? null);
      const idx = inv.findIndex(it => it?.id === choice.takeItem);
      if (idx !== -1) inv[idx] = null;
      updates.inventory = inv;
    }
    setGameState(updates);

    if (choice.next) setCurrentNode(DIALOGUE_DATA[choice.next]);
    else onExit();
  };

  const onDiceComplete = (success) => {
    const resultKey = success ? activeCheck.success : activeCheck.failure;
    setShowDice(false);
    setActiveCheck(null);
    setCurrentNode(DIALOGUE_DATA[resultKey]);
  };

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

            {/* DIALOGUE OPTIONS
                requireItem    — hidden unless item is in inventory
                requireFlag    — hidden unless flag is set
                requireNoFlag  — hidden if flag is set */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
              {currentNode.options.filter(opt => {
                if (opt.requireItem    && !(gameState.inventory || []).some(it => it?.id === opt.requireItem)) return false;
                if (opt.requireFlag    && !gameState.flags?.[opt.requireFlag])   return false;
                if (opt.requireNoFlag  &&  gameState.flags?.[opt.requireNoFlag]) return false;
                return true;
              }).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => processChoice(opt)}
                  style={{
                    background: 'none', border: '1px solid #000', color: '#000',
                    padding: '12px', textAlign: 'left', cursor: 'pointer',
                    fontFamily: 'serif', fontSize: '15px', fontWeight: '900',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#000'; }}
                >
                  {i + 1}. {opt.text}
                </button>
              ))}
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

      {/* 2. THE COLOSSAL PORTRAITS */}
      <div style={{
        position: 'absolute', bottom: '-20px', left: 0, right: 0,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        width: '100vw', padding: '0 2.5%', pointerEvents: 'none', zIndex: 100,
      }}>
        {/* Maya — always left */}
        <div style={{ width: '945px', flexShrink: 0, marginLeft: '8%' }}>
          <img
            src="/ui/portraits/protagonist_portrait.png"
            style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(20px 0 40px rgba(0,0,0,0.8))' }}
            alt="Maya"
          />
        </div>

        {/* NPC — right side. Hides gracefully if no portrait exists for this speaker */}
        <div style={{ width: '945px', flexShrink: 0, marginRight: '10%' }}>
          {npcPortraitSrc && !npcPortraitError && (
            <img
              src={npcPortraitSrc}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(-20px 0 40px rgba(0,0,0,0.8))' }}
              alt={currentNode.speaker}
              onError={() => setNpcPortraitError(true)}
            />
          )}
        </div>
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
