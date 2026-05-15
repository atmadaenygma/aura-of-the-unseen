# Problems to Solve — Aura of the Unseen

## IN PROGRESS 🔴

### 1. Spawn Locations Not Working
**Issue**: Player spawn positions are incorrect when transitioning between rooms.

**Affected Areas**: 
- Spawn points in exits configuration
- NPC spawn positions
- Room entry/exit transitions

**Files to Check**: 
- `src/data/worldManifest.js` — exit spawn coordinates
- `src/components/Stage.jsx` — spawn position handling

**Status**: NEEDS INVESTIGATION

---

## IN PROGRESS 🔴

### 2. Typewriter Effect Not Left-to-Right
**Issue**: Typewriter text animation is not moving left-to-right as required.

**Expected Behavior**: All dialogue text should reveal character-by-character with a left-to-right scan line gradient (90deg).

**Files to Check**: 
- `src/components/DialogueSystem.jsx` (lines ~358-380) — gradient direction and animation logic

**Status**: NEEDS INVESTIGATION

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

