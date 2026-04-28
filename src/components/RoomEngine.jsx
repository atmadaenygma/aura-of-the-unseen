// src/components/RoomEngine.jsx
export const RoomEngine = ({ playerPos }) => {
  return (
    <div className="relative w-[1200px] h-[800px] overflow-hidden bg-black">
      
      {/* 1. BACKGROUND (The Full Room) */}
      <img 
        src="/textures/full_room.jpg" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
      />

      {/* 2. THE PLAYER (Controlled via WASD) */}
      <div 
        style={{ 
          left: playerPos.x, 
          top: playerPos.y, 
          zIndex: Math.floor(playerPos.y) // Dynamic Z-Index!
        }}
        className="absolute w-12 h-24 -ml-6 -mt-20 transition-all duration-75"
      >
        <img src="/sprites/protagonist.png" className="w-full h-full" />
      </div>

      {/* 3. OVERLAYS (Only the things you can go BEHIND) */}
      {/* If player's Y is less than the table's base, they are BEHIND it. */}
      <img 
        src="/textures/table_overlay.png" 
        style={{ zIndex: 650 }} // Static Z-index at the 'feet' of the table
        className="absolute left-[20%] top-[60%] w-[300px] pointer-events-none" 
      />
      
      <img 
        src="/textures/bed_overlay.png" 
        style={{ zIndex: 400 }} // Static Z-index at the 'feet' of the bed
        className="absolute left-[65%] top-[40%] w-[350px] pointer-events-none" 
      />

    </div>
  )
}