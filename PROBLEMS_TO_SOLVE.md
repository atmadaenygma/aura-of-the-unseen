# Problems to Solve — Aura of the Unseen

## IN PROGRESS 🟢

### 1. Spawn System — Permanent Solution Implemented
**Issue**: Scalable spawn point system for multi-map games with multiple exits per room.

**Solution Implemented**: 
- Each room now owns its spawn logic via `spawnPoints` object with `entry` and `from` fields
- `from` field maps source rooms to their spawn coordinates in the destination
- Eliminated cross-room coordinate scatter — all spawn data is self-contained per room
- Replaced async mask-based fallback with direct manifest lookup

**Architecture**:
```js
room: {
  spawnPoints: {
    entry: { x, y },              // Default spawn (no known origin)
    from: {
      "other_room": { x, y },     // Where to appear when coming from other_room
      "another_room": { x, y },   // Multiple bidirectional connections
    }
  }
}
```

**Files Modified**: 
- `src/data/worldManifest.js` — added spawnPoints to all rooms, removed spawnX/spawnY from exits
- `src/components/Stage.jsx` — replaced complex exit logic with simple 4-level fallback

**Scales To**: Unlimited rooms, unlimited exits per room. Adding a new room = add spawnPoints object

**Status**: IMPLEMENTED & READY FOR MULTI-MAP EXPANSION

---

## COMPLETE ✅

### 2. Typewriter Effect — All Text Left-to-Right
**Issue**: Fixed — All dialogue now displays left-to-right with proper scan line animation.

**Solution**: Modified DialogueSystem.jsx to force left text alignment and scan line positioning regardless of speaker side.

**Status**: SOLVED

---

## IN PROGRESS 🔴

### 3. Loading Screen Not Working
**Issue**: Loading screens are not appearing on room transitions.

**Expected Behavior**: Loading screen should display and remain visible during room load, then dismiss when ready.

**Files to Check**: 
- `src/components/Stage.jsx` — showLoading state and useEffect logic
- `src/components/LoadingScreen.jsx` — component render

**Status**: NEEDS INVESTIGATION

---

## REFERENCE

### Configuration Values
- silas_cabin dimensions (15% smaller): 1632×918
- silas_cabin spawn: 816, 459
- silas_cabin exit to overseers_house_exterior: 895, 344
- Typewriter speed: 60ms per character
- Typewriter gradient: 90deg (left-to-right)

### Investigation Notes
- All three issues appear on deployed Vercel build
- Issues persist despite previous fixes being committed
- Need to verify code is actually being deployed correctly

