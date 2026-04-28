// src/components/Player.jsx
import { useNavigation } from '../hooks/useNavigation';

export const Player = ({ onStress }) => {
  const [pos, setPos] = useState({ x: 0, z: 0 });
  const { checkCollision } = useNavigation('/textures/room_mask.png');

  const movePlayer = (dx, dz) => {
    const nextX = pos.x + dx;
    const nextZ = pos.z + dz;

    // Convert 3D position to Normalized Mask Position (0.0 to 1.0)
    // Adjust '10' based on your floor's 3D scale
    const normX = nextX / 10; 
    const normZ = nextZ / 10;

    const result = checkCollision(normX, normZ);

    if (result !== 'BLOCK') {
      setPos({ x: nextX, z: nextZ });
      
      if (result === 'STRESS') onStress(-0.5); // Drain Self-Control
      if (result === 'INTERACT') console.log("Press E to Search");
    }
  };

  // ... rest of your WASD listeners calling movePlayer ...
};