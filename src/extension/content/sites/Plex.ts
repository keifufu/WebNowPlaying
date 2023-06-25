import { getMediaSessionCover } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from "../selectors";

const site: Site = {
  match: () => !!(window as any).plex,
  ready: () => querySelector<boolean, HTMLVideoElement>("video", (el) => el !== null && el.duration > 0, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "Plex",
    state: () =>
      querySelectorReport<StateMode, HTMLVideoElement>(
        "video",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.STOPPED,
        "state"
      ),
    // Not reporting because some views on Plex don't have a title (live TV)
    title: () => querySelector<string, HTMLElement>('[class*="MetadataPosterTitle-title"]', (el) => el.innerText, document.title),
    // Not reporting because some views on Plex don't have a artist (live TV)
    artist: () => querySelector<string, HTMLElement>('[data-testid="metadataYear"]', (el) => el.innerText, ""),
    album: () => "",
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => el.duration, 0, "durationSeconds"),
    positionSeconds: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => el.currentTime, 0, "positionSeconds"),
    volume: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => (el.muted ? 0 : el.volume * 100), 100, "volume"),
    rating: () => 0,
    // Not reporting because some views on Plex don't have a repeat button (live TV)
    repeatMode: () =>
      querySelector<RepeatMode, HTMLButtonElement>(
        'button[data-testid="repeatButton"], button[data-testid="repeatOneButton"]',
        (el) => {
          if (el.className.includes("Active")) {
            if (el.getAttribute("data-testid") === "repeatButton") return RepeatMode.ALL;
            else return RepeatMode.ONE;
          }
          return RepeatMode.NONE;
        },
        RepeatMode.NONE
      ),
    // Not reporting because some views on Plex don't have a shuffle button (live TV)
    shuffleActive: () =>
      querySelector<boolean, HTMLButtonElement>('button[data-testid="shuffleButton"]', (el) => el.className.includes("Active"), false),
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLButtonElement>(
        'button[data-testid="pauseButton"], button[data-testid="resumeButton"], button[data-testid="closeButton"]',
        (el) => {
          el.dispatchEvent(
            new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            })
          );
        },
        "setState"
      );
    },
    skipPrevious: () => {
      querySelectorEventReport<HTMLButtonElement>(
        'button[data-testid="previousButton"]',
        (el) => {
          el.dispatchEvent(
            new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            })
          );
        },
        "skipPrevious"
      );
    },
    skipNext: () => {
      querySelectorEventReport<HTMLButtonElement>(
        'button[data-testid="nextButton"]',
        (el) => {
          el.dispatchEvent(
            new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            })
          );
        },
        "skipNext"
      );
    },
    setPositionSeconds: (positionInSeconds: number) =>
      querySelectorEventReport<HTMLVideoElement>("video", (el) => (el.currentTime = positionInSeconds), "setPositionSeconds"),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>(
        "video",
        (el) => {
          el.volume = volume / 100;
          if (volume === 0) el.muted = true;
          else el.muted = false;
        },
        "setVolume"
      );
    },
    toggleRepeatMode: () => {
      querySelectorEvent<HTMLButtonElement>('button[data-testid="repeatButton"], button[data-testid="repeatOneButton"]', (el) => {
        el.dispatchEvent(
          new MouseEvent("mousedown", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          })
        );
        el.dispatchEvent(
          new MouseEvent("mouseup", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          })
        );
      });
    },
    toggleShuffleActive: () => {
      querySelectorEvent<HTMLButtonElement>('button[data-testid="shuffleButton"]', (el) => {
        el.dispatchEvent(
          new MouseEvent("mousedown", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          })
        );
        el.dispatchEvent(
          new MouseEvent("mouseup", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          })
        );
      });
    },
    setRating: null,
  },
};

export default site;
