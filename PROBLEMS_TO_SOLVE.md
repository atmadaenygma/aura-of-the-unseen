# Problems to Solve — Aura of the Unseen

## IN PROGRESS 🔴

### 1. Spawn System — Architecture In Place, Behavior TBD
**Issue**: Scalable spawn point system for multi-map games with multiple exits per room.

**Current Status**: 
- Architecture implemented (spawnPoints object with `entry` and `from` fields)
- worldManifest.js has all spawn data correctly defined
- Stage.jsx has spawn resolution logic in place
- Character.jsx position reset on room change implemented
- **However**: Player spawn locations still not matching expected coordinates

**What's Been Tried**:
- Fixed sourceRoom vs locationID bug in Stage.jsx
- Added Character position reset useEffect when initialPos changes
- Verified console logs show correct coordinates being calculated
- Visual testing shows spawn still not respecting from[sourceRoom] mappings

**Files Modified**: 
- `src/data/worldManifest.js` — spawnPoints structure on all rooms
- `src/components/Stage.jsx` — spawn resolution with 4-level fallback
- `src/components/Character.jsx` — position reset on room transition

**Root Cause**: Unknown - coordinate values correct in console, but not reflected in-game

**Scales To**: Would scale to unlimited rooms/exits once behavior is fixed

**Status**: PARTIALLY IMPLEMENTED - NEEDS INVESTIGATION

---

## COMPLETE ✅

### 2. Typewriter Effect — All Text Left-to-Right
**Issue**: Fixed — All dialogue now displays left-to-right with proper scan line animation.

**Solution**: Modified DialogueSystem.jsx to force left text alignment and scan line positioning regardless of speaker side.

**Status**: SOLVED

---

## COMPLETE ✅

### 3. Loading Screen — Fixed
**Issue**: Loading screens were not appearing on room transitions.

**Solution**: Added `locationID` to the dependency array of the hide effect in Stage.jsx.
- The hide effect was only watching `isReady` changes
- When transitioning rooms with isReady already true, the screen never hid
- Now fires on both `isReady` changes AND `locationID` changes

**Behavior**: 
- Shows on room transition (locationID change)
- Hides immediately if assets ready (isReady already true)
- Hides when assets finish loading (slow transitions)
- Works with keyboard (Space, Enter, E, A) and gamepad (A button)

**Status**: SOLVED

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

