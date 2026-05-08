import React from 'react';
import { CHAPTER_REGISTRY } from '../data/worldManifest';

const BG      = '#d6cab0';
const ACCENT  = '#cb7866';
const TEXT    = '#3a2010';
const TEXT_DIM= 'rgba(58,32,16,0.55)';
const BORDER  = 'rgba(58,32,16,0.2)';
const FONT    = 'Courier New, monospace';
const FONT_SER= 'Georgia, serif';

export const ChapterGateUI = ({ chapterNumber, onBack }) => {
  const chapter = CHAPTER_REGISTRY[chapterNumber];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9900,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: BG,
        borderTop: `2px solid ${ACCENT}`,
        border: `1px solid ${BORDER}`,
        padding: '40px 48px',
        maxWidth: 520,
        textAlign: 'center',
        boxShadow: '0 0 80px rgba(0,0,0,0.7)',
      }}>
        {/* Chapter label */}
        <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '3px', color: ACCENT, textTransform: 'uppercase', marginBottom: 12 }}>
          Chapter {chapterNumber}
        </div>

        {/* Chapter title */}
        <div style={{ fontFamily: FONT, fontSize: 18, letterSpacing: '2px', color: TEXT, textTransform: 'uppercase', marginBottom: 20 }}>
          {chapter?.title ?? `Chapter ${chapterNumber}`}
        </div>

        {/* Description */}
        <div style={{ fontFamily: FONT_SER, fontSize: 15, fontStyle: 'italic', color: TEXT_DIM, lineHeight: 1.8, marginBottom: 32 }}>
          {chapter?.description ?? 'This chapter is part of the full game.'}
        </div>

        <div style={{ height: 1, background: BORDER, marginBottom: 28 }} />

        {/* Purchase prompt */}
        <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '2px', color: TEXT, textTransform: 'uppercase', marginBottom: 8 }}>
          This chapter is part of the full game
        </div>
        <div style={{ fontFamily: FONT_SER, fontSize: 13, fontStyle: 'italic', color: TEXT_DIM, lineHeight: 1.7, marginBottom: 28 }}>
          Your Chapter 1 progress is saved. Purchase the full game and continue exactly where you left off — no replaying.
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: TEXT_DIM, fontFamily: FONT, fontSize: 9,
              letterSpacing: '2px', padding: '10px 20px',
              cursor: 'pointer', textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT_DIM; }}
          >
            ← Go Back
          </button>

          {/* Purchase button — wire to your storefront URL when ready */}
          <button
            onClick={() => window.open('https://your-store-link-here.com', '_blank')}
            style={{
              background: ACCENT, border: `1px solid ${ACCENT}`,
              color: '#fff', fontFamily: FONT, fontSize: 9,
              letterSpacing: '2px', padding: '10px 24px',
              cursor: 'pointer', textTransform: 'uppercase',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Get the Full Game
          </button>
        </div>
      </div>
    </div>
  );
};
