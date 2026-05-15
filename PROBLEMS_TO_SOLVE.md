# Problems to Solve — Aura of the Unseen

## SOLVED ✅

### 1. Loading Screen Not Visible on Room Transitions
**Issue**: Loading screens appeared briefly then disappeared immediately, making them invisible to players.

**Root Cause**: The `hideLoading` useEffect in Stage.jsx had `showLoading` in its dependency array, causing it to fire when `showLoading` changed (setting it back to false immediately).

**Solution**: Removed `showLoading` from dependency array - now useEffect only runs when `isReady` changes.

**Commit**: 021bcc5 - "Fix: loading screen dependency array"

**Files Modified**: `src/components/Stage.jsx` line 141

**Status**: DEPLOYED to Vercel ✅

---

## PENDING 🔄

### 2. silas_cabin Room Scale — Make Everything 20% Smaller
**Issue**: silas_cabin room and all its contents (masks, overlays, NPCs, player) are too large relative to the environment.

**Scope**: Scale down by 20% (multiply all dimensions by 0.8):
- Room dimensions (worldW, worldH)
- All overlay positions and sizes
- Character scale in this room (Maya)
- NPC positions and scales
- Move speed scale

**Files to Modify**:
- `src/data/worldManifest.js` — silas_cabin room config (lines 276-336)
  - worldW: 1920 → 1536
  - worldH: 1080 → 864
  - characterScale: 1.3 → 1.04
  - moveScale: 1 → 0.8
  - All overlay yDepth values × 0.8
  - old_silas spawnX/spawnY × 0.8

**Status**: NOT STARTED

---

## REFERENCE

### Known Good Values
- Loading screen shows on room transitions (verified working)
- Typewriter effect: both speakers left-to-right (90deg gradient) ✅
- silas_cabin exit spawn: 895, 344 ✅
- overseers_house_exterior entrance to silas_cabin: 895, 344 ✅

### Recent Commits
- 021bcc5: Loading screen dependency fix
- 9611468: major updates (loading screen + typewriter implementation)

---

## Next Steps
1. Scale silas_cabin room and contents by 20%
2. Test room proportions look correct
3. Verify NPC positions still make sense in scaled room
4. Redeploy to Vercel

