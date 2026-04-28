import React, { useState, useEffect, useRef } from 'react';
import { DIALOGUE_DATA } from '../data/dialogue';
import { DiceCheck } from './DiceCheck';

export const DialogueSystem = ({ dialogueKey, gameState, setGameState, onExit }) => {
  const [currentNode, setCurrentNode] = useState(DIALOGUE_DATA[dialogueKey]);
  const [history, setHistory] = useState([]); 
  const [activeCheck, setActiveCheck] = useState(null);
  const [showDice, setShowDice] = useState(false);
  
  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentNode, showDice]);

  const getNPCPortrait = (speaker) => {
    if (!speaker) return '';
    const slug = speaker.toLowerCase().replace('old ', '').replace(' ', '_');
    return `/ui/portraits/${slug}_portrait.png`;
  };

  const processChoice = (choice) => {
    // Record current node into history
    setHistory(prev => [...prev, {
      speaker: currentNode.speaker,
      text: currentNode.text,
      side: currentNode.side,
      introspection: currentNode.introspection,
      facet: currentNode.facet,
      chosenOption: choice.text 
    }]);

    if (choice.check) {
      setActiveCheck(choice);
      setShowDice(true);
      return;
    }

    const updates = { ...gameState };
    if (choice.flagTrigger) updates.flags = { ...updates.flags, [choice.flagTrigger]: true };
    if (choice.impact) updates.integrity = Math.max(0, updates.integrity + choice.impact);
    if (choice.rewardMoney) updates.money += choice.rewardMoney;
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(7px)', overflow: 'hidden'
    }}>
      
      {/* 1. THE SCROLLABLE CENTERED LEDGER */}
      <div 
        ref={scrollRef}
        className="ledger-scroll-container"
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '450px', height: '650px', background: '#fff', border: '8px double #000',
          padding: '40px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8)', zIndex: 10, overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        
        {/* HISTORY (Includes previous banners) */}
        {history.map((record, idx) => (
          <div key={`hist-${idx}`} style={{ marginBottom: '40px', opacity: 0.5, borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            {record.facet && (
                <img src={`/ui/concious_thoughts/${record.facet}.png`} style={{ width: '100%', height: 'auto', opacity: 0.4, marginBottom: '10px' }} />
            )}
            <div style={{ textAlign: record.side === 'left' ? 'left' : 'right', color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{record.speaker}</div>
            <div style={{ textAlign: record.side === 'left' ? 'left' : 'right', color: '#444', fontSize: '16px', fontFamily: 'serif', fontStyle: 'italic' }}>"{record.text}"</div>
            <div style={{ textAlign: 'left', color: '#000', fontSize: '13px', marginTop: '10px', fontWeight: 'bold' }}>Maya: "{record.chosenOption}"</div>
          </div>
        ))}

        {!showDice ? (
          <div style={{ minHeight: '100%' }}>
            <div style={{ textAlign: currentNode.side === 'left' ? 'left' : 'right', color: '#000', fontSize: '13px', fontWeight: '900', letterSpacing: '5px', marginBottom: '20px', borderBottom: '3px solid #000', paddingBottom: '10px' }}>
              {currentNode.speaker.toUpperCase()}
            </div>

            <div style={{ textAlign: currentNode.side === 'left' ? 'left' : 'right', color: '#000', fontSize: '21px', fontFamily: 'serif', lineHeight: '1.4', marginBottom: '30px', fontWeight: '600' }}>
              "{currentNode.text}"
            </div>

            {/* --- THE FACET BANNER (Current Node) --- */}
            {currentNode.introspection && (
                <div style={{ position: 'relative', background: '#f0fafa', padding: '0px 0px 25px 0px', border: '1px solid #00808033', marginBottom: '40px', overflow: 'hidden' }}>
                    {currentNode.facet && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img 
                                src={`/ui/concious_thoughts/${currentNode.facet}.png`} 
                                style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '15px' }} 
                                alt="Neurological Facet" 
                                onError={(e) => console.error(`MISSING ASSET: /ui/concious_thoughts/${currentNode.facet}.png`)}
                            />
                            <span style={{ color: '#008080', fontSize: '12px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid #00808033', paddingBottom: '5px' }}>
                                {currentNode.facet.replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}
                    <div style={{ color: '#008080', fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', opacity: 0.9, textAlign: 'center', padding: '0 25px' }}>
                        {currentNode.introspection}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
              {currentNode.options.map((opt, i) => (
                <button key={i} onClick={() => processChoice(opt)} style={{ background: 'none', border: '1px solid #000', color: '#000', padding: '12px', textAlign: 'left', cursor: 'pointer', fontFamily: 'serif', fontSize: '15px', fontWeight: '900', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { e.target.style.background = '#000'; e.target.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#000'; }}
                >
                  {i + 1}. {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', borderTop: '2px solid black', marginTop: '20px' }}>
              <DiceCheck skill={activeCheck.check.skill} difficulty={activeCheck.check.difficulty} onComplete={onDiceComplete} />
          </div>
        )}
      </div>

      {/* 2. THE COLOSSAL PORTRAITS */}
      <div style={{ position: 'absolute', bottom: '-20px', left: 0, right: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100vw', padding: '0 2.5%', pointerEvents: 'none', zIndex: 100 }}>
        <div style={{ width: '945px', flexShrink: 0, marginLeft: '8%' }}>
          <img src="/ui/portraits/protagonist_portrait.png" style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(20px 0 40px rgba(0,0,0,0.8))' }} alt="Maya" />
        </div>
        <div style={{ width: '945px', flexShrink: 0, marginRight: '10%' }}>
          <img src={getNPCPortrait(currentNode.speaker)} style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(-20px 0 40px rgba(0,0,0,0.8))' }} alt="NPC" onError={(e) => { e.target.src = '/ui/portraits/silas_portrait.png'; }} />
        </div>
      </div>

      <style>{`
        .ledger-scroll-container::-webkit-scrollbar { width: 6px; }
        .ledger-scroll-container::-webkit-scrollbar-track { background: #f1f1f1; }
        .ledger-scroll-container::-webkit-scrollbar-thumb { background: #000; }
        .ledger-scroll-container::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
};