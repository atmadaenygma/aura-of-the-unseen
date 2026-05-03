// inside the game loop or [E] listener
const onKey = (e) => {
  if (e.key.toLowerCase() === 'e') {
    // 1. Get the color from our dual-mask check
    const { type, entityColor } = checkPixel(pos.current.x, pos.current.y, 1280, 800);

    if (type === 'INTERACT') {
      // 2. Find the entity in the manifest using the Color Code as the key
      const entity = ROOM_ALPHA_MANIFEST.entities[entityColor];

      if (entity) {
        setActiveArtifact({
          title: entity.name,
          text: entity.text,
          source: entity.source || "Historical Fragment"
        });
        
        // 3. Update global game state
        setGameState(prev => ({
          ...prev,
          money: prev.money + (entity.rewardMoney || 0),
          morphStability: Math.max(0, prev.morphStability + entity.impact)
        }));
      }
    }
    // ... handle Exit ...
  }
};