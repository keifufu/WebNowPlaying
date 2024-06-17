import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, ratingUtils, setStatePlayPauseButton } from "../utils";

let elapsedSeconds = 0;
let lastTime = Date.now() / 1000;
function getElapsedTime() {
  if (RadioAddict.info.state() !== StateMode.PLAYING) {
    lastTime = Date.now() / 1000;
    return elapsedSeconds;
  }

  const timeNow = Date.now() / 1000;
  const delta = Math.floor(timeNow - lastTime);
  if (delta > 0) {
    elapsedSeconds += delta;
    lastTime = timeNow;
  }

  return elapsedSeconds;
}

const RadioAddict: Site = {
  debug: {
    getElapsedTime,
  },
  init: null,
  ready: () => !!navigator.mediaSession.metadata,
  info: createSiteInfo({
    name: () => "Radio Addict",
    // this site used to show the title but now it's only the artist
    // the title has to be _something_ otherwise it's deemed inactive.
    title: () => document.querySelector<HTMLElement>(".player-infos li")?.innerText ?? "",
    artist: () => document.querySelector<HTMLElement>(".player-infos li")?.innerText ?? "",
    album: () => "",
    cover: () => getMediaSessionCover(),
    state: () => {
      const el = document.querySelector(".player-playpause i");
      if (!el) return StateMode.STOPPED;
      return el.classList.contains("bi-pause-circle") ? StateMode.PLAYING : StateMode.PAUSED;
    },
    position: () => getElapsedTime(),
    duration: () => getElapsedTime(),
    volume: () => (document.querySelector(".player-muted") ? 0 : 100),
    rating: () => (document.querySelector(".player-favorite")?.classList.contains("player-favorite-added") ? 5 : 0),
    repeat: () => Repeat.NONE,
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      const button = document.querySelector<HTMLButtonElement>(".player-playpause");
      if (!button) throw new Event("Failed to find button");
      const currentState = RadioAddict.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>(".player-radio-previous");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>(".player-radio-previous");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: null,
    setVolume: (volume) => {
      const currVolume = RadioAddict.info.volume();
      if ((currVolume === 0 && volume > 0) || (currVolume === 100 && volume < 100)) {
        const button = document.querySelector<HTMLButtonElement>(".player-sound");
        if (!button) throw new EventError();
        button.click();
      }
    },
    setRating: (rating) => {
      ratingUtils.like(RadioAddict, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".player-favorite");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: null,
    setShuffle: null,
  },
  controls: () => createDefaultControls(RadioAddict),
};

export default RadioAddict;
