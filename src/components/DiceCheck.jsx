import React, { useState, useEffect } from 'react';

export const DiceCheck = ({ skill, difficulty, onComplete }) => {
  const [dice, setDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      setRolling(false);
      const success = (d1 + d2) >= difficulty;
      setResult(success ? 'SUCCESS' : 'FAILURE');
      setTimeout(() => onComplete(success), 1500);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', color: '#000', fontFamily: 'serif' }}>
      <div style={{ fontSize: '11px', letterSpacing: '4px', marginBottom: '20px', fontWeight: '900' }}>
        PROBABILITY: {skill.toUpperCase()}
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ 
            width: '70px', height: '70px', border: '3px solid black', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', fontWeight: '900', background: '#fff'
          }}>
            {rolling ? '?' : dice[i]}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>THRESHOLD: {difficulty}</div>
      {result && (
        <div style={{ 
          fontSize: '24px', letterSpacing: '6px', fontWeight: '900', 
          color: result === 'SUCCESS' ? '#006600' : '#880000',
          borderTop: '2px solid black', paddingTop: '15px'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};