/**
 * wnp.js - keifufu
 * licensed under MIT
 *
 * This allows simple access to the WebNowPlaying browser extension.
 * While not as feature-complete as v3 adapters, this exposes the
 * currently "active" player and lets you control it.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
const wnpState = {
  PLAYING: 0,
  PAUSED: 1,
  STOPPED: 2,
};

const wnpRatingSystem = {
  NONE: 0,
  LIKE: 1,
  LIKE_DISLIKE: 2,
  SCALE: 3,
};

const wnpRepeat = {
  NONE: 1 << 0,
  ALL: 1 << 1,
  ONE: 1 << 2,
};

let wnpPlayer = {
  id: 0,
  name: "",
  title: "",
  artist: "",
  album: "",
  cover: "",
  state: wnpState.STOPPED,
  duration: 0,
  position: 0,
  volume: 100,
  rating: 0,
  repeat: wnpRepeat.NONE,
  shuffle: false,
  ratingSystem: wnpRatingSystem.NONE,
  availableRepeat: wnpRepeat.NONE,
  canSetState: false,
  canSkipPrevious: false,
  canSkipNext: false,
  canSetPosition: false,
  canSetVolume: false,
  canSetRating: false,
  canSetRepeat: false,
  canSetShuffle: false,
  createdAt: 0,
  updatedAt: 0,
  activeAt: 0,
};

let wnpStarted = false;
let wnpCallback = null;

/**
 * Callback for when an update was sent.
 * The callback will be called with the current player as the argument.
 * This will fire a lot even if nothing has changed, as it's fired
 * every time we query the player state (every 250ms currently).
 */
function wnpOnUpdate(callback) {
  if (typeof callback === "function") {
    wnpCallback = callback;
  }
}

function wnpStart() {
  wnpStarted = true;
  window.postMessage(
    {
      type: "wnp-info",
      subscribe: true,
    },
    "*",
  );

  window.addEventListener("message", (msg) => {
    if (msg.data.type != "wnp-info" || !msg.data.player) return;
    wnpPlayer = msg.data.player;
    if (typeof wnpCallback === "function") {
      wnpCallback(wnpPlayer);
    }
  });
}

function wnpStop() {
  wnpStarted = false;
  window.postMessage({ type: "wnp-info", subscribe: false }, "*");
}

const wnpEvents = {
  TRY_SET_STATE: 0,
  TRY_SKIP_PREVIOUS: 1,
  TRY_SKIP_NEXT: 2,
  TRY_SET_POSITION: 3,
  TRY_SET_VOLUME: 4,
  TRY_SET_RATING: 5,
  TRY_SET_REPEAT: 6,
  TRY_SET_SHUFFLE: 7,
};

function wnpTrySetState(state) {
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SET_STATE} ${state}` });
}

function wnpTryTogglePlayPause() {
  wnpTrySetState(wnpPlayer.state === wnpState.PLAYING ? wnpState.PAUSED : wnpState.PLAYING);
}

function wnpTrySkipPrevious() {
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SKIP_PREVIOUS}` });
}

function wnpTrySkipNext() {
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SKIP_NEXT}` });
}

function wnpTrySetPosition(seconds) {
  if (seconds < 0) seconds = 0;
  if (seconds > wnpPlayer.duration) seconds = wnpPlayer.duration;
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SET_POSITION} ${seconds}:` });
}

function wnpTrySetVolume(volume) {
  if (volume < 0) volume = 0;
  if (volume > 100) volume = 100;
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SET_VOLUME} ${volume}` });
}

function wnpTrySetRating(rating) {
  if (rating < 0) rating = 0;
  if (rating > 5) rating = 5;
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SET_RATING} ${rating}` });
}

function wnpTrySetRepeat(repeat) {
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SET_REPEAT} ${repeat}` });
}

function wnpTrySetShuffle(shuffle) {
  window.postMessage({ type: "wnp-info", command: `${wnpEvents.TRY_SET_SHUFFLE} ${shuffle ? 1 : 0}` });
}
