// ── Audio Manager ───────────────────────────────────────────────────────────────
// Simple singleton for music and SFX playback.
// Music loops automatically. SFX are one-shot.
//
// Usage:
//   import { music, sfx } from '../utils/audio';
//   music.play('test_house_ambient');   // plays /audio/music/test_house_ambient.mp3
//   music.stop();
//   sfx.play('footstep_wood');          // plays /audio/sfx/footsteps/footstep_wood.mp3
//   sfx.play('ui_open', 'ui');          // plays /audio/sfx/ui/ui_open.mp3
//
// Volume is 0–1. Master volume scales both channels.

const BASE = '/audio';

let masterVolume = 0.8;
let musicVolume  = 0.5;
let sfxVolume    = 0.8;

// ── Music ──────────────────────────────────────────────────────────────────────
let currentTrack  = null;
let currentAudio  = null;
let fadingOut     = null;

const MUSIC_TRACKS = {
  // map trackId → filename (relative to /audio/music/)
  // Add entries here as music files are dropped into public/audio/music/
  //
  // Example:
  //   test_house_ambient : 'test_house_ambient.mp3',
  //   plantation_tension : 'plantation_tension.mp3',
};

export const music = {
  play(trackId, fadeDuration = 1000) {
    if (currentTrack === trackId) return;

    // Fade out any running track
    if (currentAudio) {
      const outgoing = currentAudio;
      fadingOut      = outgoing;
      const step     = outgoing.volume / (fadeDuration / 50);
      const interval = setInterval(() => {
        outgoing.volume = Math.max(0, outgoing.volume - step);
        if (outgoing.volume <= 0) {
          outgoing.pause();
          outgoing.currentTime = 0;
          clearInterval(interval);
          if (fadingOut === outgoing) fadingOut = null;
        }
      }, 50);
    }

    const filename = MUSIC_TRACKS[trackId];
    if (!filename) {
      console.warn(`[audio] Unknown music track: "${trackId}"`);
      currentAudio = null;
      currentTrack = null;
      return;
    }

    const audio    = new Audio(`${BASE}/music/${filename}`);
    audio.loop     = true;
    audio.volume   = 0;
    currentAudio   = audio;
    currentTrack   = trackId;

    audio.play().catch(e => console.warn('[audio] Music play blocked:', e));

    // Fade in
    const target   = musicVolume * masterVolume;
    const step     = target / (fadeDuration / 50);
    const interval = setInterval(() => {
      if (audio !== currentAudio) { clearInterval(interval); return; }
      audio.volume = Math.min(target, audio.volume + step);
      if (audio.volume >= target) clearInterval(interval);
    }, 50);
  },

  stop(fadeDuration = 800) {
    if (!currentAudio) return;
    const outgoing = currentAudio;
    currentAudio   = null;
    currentTrack   = null;
    const step     = outgoing.volume / (fadeDuration / 50);
    const interval = setInterval(() => {
      outgoing.volume = Math.max(0, outgoing.volume - step);
      if (outgoing.volume <= 0) {
        outgoing.pause();
        clearInterval(interval);
      }
    }, 50);
  },

  setVolume(v) {
    musicVolume = Math.max(0, Math.min(1, v));
    if (currentAudio) currentAudio.volume = musicVolume * masterVolume;
  },

  current() { return currentTrack; },
};

// ── SFX ────────────────────────────────────────────────────────────────────────
// subfolder map — keeps filenames short at call sites
const SFX_FOLDERS = {
  footsteps: 'footsteps',
  ui:        'ui',
  ambient:   'ambient',
  interact:  'interact',
};

const SFX_CATALOG = {
  // map sfxId → { folder, file }
  // Add entries here as SFX files land in public/audio/sfx/
  //
  // Footsteps
  //   footstep_wood  : { folder: 'footsteps', file: 'footstep_wood.mp3'  },
  //   footstep_soft  : { folder: 'footsteps', file: 'footstep_soft.mp3'  },
  //   footstep_grass : { folder: 'footsteps', file: 'footstep_grass.mp3' },
  //   footstep_stone : { folder: 'footsteps', file: 'footstep_stone.mp3' },
  //
  // UI
  //   ui_open        : { folder: 'ui',        file: 'ui_open.mp3'        },
  //   ui_close       : { folder: 'ui',        file: 'ui_close.mp3'       },
  //   ui_select      : { folder: 'ui',        file: 'ui_select.mp3'      },
  //   ui_loot        : { folder: 'ui',        file: 'ui_loot.mp3'        },
  //
  // Interact
  //   container_open : { folder: 'interact',  file: 'container_open.mp3' },
  //   item_pickup    : { folder: 'interact',  file: 'item_pickup.mp3'    },
  //   cooking_fire   : { folder: 'interact',  file: 'cooking_fire.mp3'   },
};

export const sfx = {
  play(sfxId) {
    const entry = SFX_CATALOG[sfxId];
    if (!entry) {
      console.warn(`[audio] Unknown SFX: "${sfxId}"`);
      return;
    }
    const audio  = new Audio(`${BASE}/sfx/${entry.folder}/${entry.file}`);
    audio.volume = sfxVolume * masterVolume;
    audio.play().catch(e => console.warn('[audio] SFX play blocked:', e));
  },

  setVolume(v) { sfxVolume = Math.max(0, Math.min(1, v)); },
};

// ── Master volume ──────────────────────────────────────────────────────────────
export const setMasterVolume = (v) => {
  masterVolume = Math.max(0, Math.min(1, v));
  if (currentAudio) currentAudio.volume = musicVolume * masterVolume;
};

export const getMasterVolume = () => masterVolume;
