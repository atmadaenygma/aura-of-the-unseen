import React, { useState, useEffect, useRef } from 'react';
import { LOADING_IMAGES } from '../constants/loadingImages';
import {
  BG, BG_DARK, ACCENT, TEXT, TEXT_DIM, TEXT_MID,
  BORDER, BORDER_MED, FONT, FONT_SER, FONT_TITLE,
  OVERLAY_HEAVY, OVERLAY_MED,
} from '../constants/palette';

// ── Font loading ───────────────────────────────────────────────────────────────
const FONT_FACE = `
  @font-face {
    font-family: 'NexaRustSlab';
    src: url('/fonts/NexaRustSlabDemo-BlackShadow1.otf') format('opentype');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }
`;

// ── Historical facts ───────────────────────────────────────────────────────────
// All facts are documented history. Sources: TransAtlantic Slave Trade Database,
// National Archives, Frederick Douglass Papers, US Census Records.
const HISTORICAL_FACTS = [
  {
    fact: "Between 1525 and 1866, approximately 12.5 million Africans were forcibly transported across the Atlantic Ocean. An estimated 1.5 to 2 million died at sea. Their bodies mapped the route.",
    source: "Trans-Atlantic Slave Trade Database",
  },
  {
    fact: "In 1860 — the year before the Civil War — enslaved people in the United States were valued at nearly $3 billion. This exceeded the combined value of all the nation's railroads and factories. Slavery was not a dying institution. It was at its most profitable.",
    source: "US Census Records, 1860",
  },
  {
    fact: "Literacy was a criminal offence for enslaved people in most Southern states. Teaching an enslaved person to read could result in imprisonment or death. This was not ignorance — it was policy. Knowledge was the threat.",
    source: "Slave Codes of the American South",
  },
  {
    fact: "The last known surviving person born into American slavery, Sylvester Magee, died in 1971. The institution of slavery is within the living memory of people alive today.",
    source: "Mississippi State Records",
  },
  {
    fact: "The Fugitive Slave Act of 1850 required citizens in free states to assist in the capture of escaped enslaved people. Free Black people could be seized and re-enslaved on minimal legal pretext. Freedom on paper was not freedom in practice.",
    source: "Fugitive Slave Act, 31st Congress",
  },
  {
    fact: "New Orleans operated the largest slave market in North America. Families were separated and sold as routine commerce. Estate inventories listed enslaved people beside livestock and farm equipment — assigned a dollar value, a condition rating, and nothing more.",
    source: "Louisiana Historical Records",
  },
  {
    fact: "During the Reconstruction era (1865–1877), over 2,000 Black Americans were elected to public office. By 1900, systematic terror, voter suppression, and legislation had dismantled nearly all of it. The promise was made — and methodically broken.",
    source: "Congressional Records, 39th–50th Congress",
  },
  {
    fact: "Frederick Douglass was born into slavery in 1818. He taught himself to read against the law, escaped, and became one of the most influential writers and orators of the 19th century. The law was never about the limits of Black intellect. It was about the limits of white power.",
    source: "Narrative of the Life of Frederick Douglass, 1845",
  },
  {
    fact: "At the peak of the domestic slave trade (1820–1860), an estimated 1 million enslaved people were forcibly relocated from the Upper South to the Deep South to feed the cotton and sugar economies. The separation of families was not a byproduct — it was the mechanism.",
    source: "Ira Berlin, 'Generations of Captivity', 2003",
  },
  {
    fact: "The word 'slavery' does not appear in the original United States Constitution. Enslaved people are referred to as 'other persons' and 'such persons.' The language of law has always understood that to name a thing clearly is to make it harder to justify.",
    source: "United States Constitution, 1787",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export const LoadingScreen = ({ onContinue }) => {
  const [factIdx]   = useState(() => Math.floor(Math.random() * HISTORICAL_FACTS.length));
  const [imgSrc]    = useState(() => {
    if (LOADING_IMAGES.length === 0) return null;
    return LOADING_IMAGES[Math.floor(Math.random() * LOADING_IMAGES.length)];
  });
  const [imgError,  setImgError]  = useState(false);
  const [pulse,     setPulse]     = useState(true);
  const [ready,     setReady]     = useState(false);

  const fact = HISTORICAL_FACTS[factIdx];

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Pulse the prompt text
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(id);
  }, []);

  // Keyboard: Space / Enter / any key continues
  useEffect(() => {
    const handler = (e) => {
      if (['Space', 'Enter', 'KeyE', 'KeyA'].includes(e.code)) onContinue();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onContinue]);

  // Gamepad: A button polling
  useEffect(() => {
    let frame;
    const prevA = { pressed: false };
    const poll  = () => {
      const pads = navigator.getGamepads?.() ?? [];
      for (let i = 0; i < pads.length; i++) {
        const gp = pads[i];
        if (!gp) continue;
        const aBtn = gp.buttons[0];
        const now  = !!(aBtn?.pressed) || (aBtn?.value ?? 0) > 0.5;
        if (now && !prevA.pressed) { onContinue(); return; }
        prevA.pressed = now;
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [onContinue]);

  const showImage = imgSrc && !imgError;

  return (
    <div
      onClick={onContinue}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.6s ease',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <style>{FONT_FACE}</style>
      {/* Background image */}
      {showImage && (
        <img
          src={imgSrc}
          onError={() => setImgError(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'blur(2px)', transform: 'scale(1.04)',
          }}
          alt=""
        />
      )}

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: showImage
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%)'
          : 'rgba(0,0,0,0.96)',
      }} />

      {/* Game title — top */}
      <div style={{
        position: 'absolute', top: '6vh', left: 0, right: 0,
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT_TITLE,
          fontSize: 'clamp(28px, 3.5vw, 48px)',
          color: BG, letterSpacing: '4px',
          textShadow: '0 2px 20px rgba(0,0,0,0.9)',
        }}>
          BLACKTRACK
        </div>
      </div>

      {/* Historical fact — center */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '680px', width: '88%',
        padding: '0 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        {/* Outer double-border box */}
        <div style={{ border: `2px solid ${BG}`, padding: 3, width: '100%' }}>
          <div style={{
            border: `1px solid rgba(214,202,176,0.35)`,
            padding: '28px 32px',
            background: 'rgba(10,8,6,0.78)',
            backdropFilter: 'blur(8px)',
          }}>
            {/* Fact label */}
            <div style={{
              fontFamily: FONT, fontSize: 9, letterSpacing: '3px',
              color: ACCENT, textTransform: 'uppercase', marginBottom: 16,
            }}>
              Historical Record
            </div>

            {/* Fact text */}
            <div style={{
              fontFamily: FONT_SER, fontStyle: 'italic',
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              color: BG, lineHeight: 1.8,
              marginBottom: 18,
            }}>
              "{fact.fact}"
            </div>

            {/* Source */}
            <div style={{
              fontFamily: FONT, fontSize: 9, letterSpacing: '1.5px',
              color: `rgba(214,202,176,0.45)`, textTransform: 'uppercase',
            }}>
              — {fact.source}
            </div>
          </div>
        </div>
      </div>

      {/* Press to continue — bottom */}
      <div style={{
        position: 'absolute', bottom: '7vh', left: 0, right: 0,
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT, fontSize: 'clamp(10px, 1vw, 13px)',
          letterSpacing: '4px', textTransform: 'uppercase',
          color: pulse ? BG : `rgba(214,202,176,0.35)`,
          transition: 'color 0.9s ease',
          textShadow: '0 1px 10px rgba(0,0,0,0.9)',
        }}>
          Press Space / Enter to continue
        </div>
      </div>
    </div>
  );
};
