import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, notDisabled, setStatePlayPauseButton } from "../utils";

// Plex sucks. I probably won't drop support any time soon but might not bother
// with less important parts like repeat mode.

const Plex: Site = {
  init: null,
  ready: () => (document.querySelector("video")?.duration || 0) > 0,
  info: createSiteInfo({
    name: () => "Plex",
    title: () => document.querySelector<HTMLElement>('[class*="MetadataPosterTitle-title"]')?.innerText ?? "",
    artist: () => document.querySelector<HTMLElement>('[data-testid="metadataYear"]')?.innerText ?? "",
    album: () => "",
    cover: () => getMediaSessionCover(),
    state: () => {
      const video = document.querySelector("video");
      if (!video) return StateMode.STOPPED;
      return video.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => document.querySelector("video")?.currentTime ?? 0,
    duration: () => document.querySelector("video")?.duration ?? 0,
    volume: () => (document.querySelector("video")?.volume ?? 1) * 100,
    rating: () => 0,
    repeat: () => {
      const el = document.querySelector('button[data-testid="repeatButton"], button[data-testid="repeatOneButton"]');
      if (el?.className.includes("Active")) {
        if (el.getAttribute("data-testid") === "repeatButton") return Repeat.ALL;
        else return Repeat.ONE;
      }
      return Repeat.NONE;
    },
    shuffle: () => document.querySelector('button[data-testid="shuffleButton"]')?.className.includes("Active") ?? false,
  }),
  events: {
    setState: (state) => {
      const button = document.querySelector<HTMLButtonElement>(
        'button[data-testid="pauseButton"], button[data-testid="resumeButton"], button[data-testid="closeButton"]',
      );
      if (!button) throw new EventError();
      const currentState = Plex.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>('button[data-testid="previousButton"]');
      if (!button) throw new EventError();
      clickButton(button);
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>('button[data-testid="nextButton"]');
      if (!button) throw new EventError();
      clickButton(button);
    },
    setPosition: (seconds) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      video.currentTime = seconds;
    },
    setVolume: (volume) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      video.muted = false;
      video.volume = volume / 100;
    },
    setRating: null,
    setRepeat: null,
    setShuffle: (shuffle) => {
      if (Plex.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>('button[data-testid="shuffleButton"]');
      if (!button) throw new EventError();
      clickButton(button);
    },
  },
  controls: () =>
    createDefaultControls(Plex, {
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: notDisabled(document.querySelector<HTMLButtonElement>('button[data-testid="previousButton"')),
      canSkipNext: notDisabled(document.querySelector<HTMLButtonElement>('button[data-testid="nextButton"')),
    }),
};

export default Plex;

function clickButton(button: HTMLButtonElement) {
  button.dispatchEvent(
    new MouseEvent("mousedown", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
    }),
  );
  button.dispatchEvent(
    new MouseEvent("mouseup", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
    }),
  );
}
