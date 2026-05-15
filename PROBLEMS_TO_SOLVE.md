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

## SOLVED ✅

### 2. silas_cabin Room Scale — Make Everything 20% Smaller
**Issue**: silas_cabin room and all its contents were too large relative to the environment.

**Solution**: Scaled down all room elements uniformly by 20% (×0.8):
- Room dimensions: 1920×1080 → 1536×864
- Spawn position: 960,540 → 768,432
- Character scale: 1.3 → 1.04 (Maya now 4% larger than baseline)
- Movement scale: 1 → 0.8
- NPC spawn: 1163,560 → 930,448
- Overlay yDepth values all scaled by 0.8

**Files Modified**: `src/data/worldManifest.js` silas_cabin config (lines 276-336)

**Commit**: 84d6b46 - "Scale silas_cabin room 20% smaller (×0.8)"

**Status**: COMPLETE — Ready to deploy ✅

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

