import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";

let shuffleState = false;
let playlistLoaded = false;
let currentCoverUrl = "";
let lastCoverVideoId = "";

const site: Site = {
  match: () => window.location.hostname === "www.youtube.com" && window.location.pathname.startsWith("/embed"),
  ready: () =>
    querySelector<boolean, HTMLElement>(".ytp-title-text", (el) => el.innerText.length > 0, false) &&
    querySelector<boolean, HTMLVideoElement>(".html5-video-player", (el) => !el.classList.contains("unstarted-mode"), false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "YouTube Embeds",
    state: () => {
      let state = querySelectorReport<StateMode, HTMLVideoElement>(
        ".html5-main-video",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED,
        "state"
      );
      // It is possible for the video to be "playing" but not started
      if (state === StateMode.PLAYING && querySelector<boolean, HTMLVideoElement>(".html5-main-video", (el) => el.played.length <= 0, false))
        state = StateMode.PAUSED;
      return state;
    },
    title: () => querySelectorReport<string, HTMLElement>(".ytp-title-text", (el) => el.innerText, "", "title"),
    // Not reporting artist, as it seems to sometimes return a empty string as innerText when the artist hasn't loaded yet.
    artist: () => querySelector<string, HTMLElement>(".ytp-title-expanded-title", (el) => el.innerText, ""),
    album: () => querySelector<string, HTMLElement>(".ytp-playlist-menu-title", (el) => el.innerText, ""),
    coverUrl: () => {
      const link = querySelectorReport<string, HTMLAnchorElement>(".ytp-title-link", (el) => el.search, "", "coverUrl");
      if (!link) return currentCoverUrl;
      const videoId = new URLSearchParams(link).get("v");

      if (videoId && lastCoverVideoId !== videoId) {
        lastCoverVideoId = videoId;
        const img = document.createElement("img");
        img.setAttribute("src", `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
        img.addEventListener("load", () => {
          if (img.height > 90) currentCoverUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
          else currentCoverUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
        });
        img.addEventListener("error", () => {
          currentCoverUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
        });
      }

      return currentCoverUrl;
    },
    durationSeconds: () => querySelectorReport<number, HTMLVideoElement>(".html5-main-video", (el) => el.duration, 0, "durationSeconds"),
    positionSeconds: () => querySelectorReport<number, HTMLVideoElement>(".html5-main-video", (el) => el.currentTime, 0, "positionSeconds"),
    volume: () => querySelectorReport<number, HTMLVideoElement>(".html5-main-video", (el) => (el.muted ? 0 : el.volume * 100), 100, "volume"),
    rating: () => 0,
    repeatMode: () =>
      querySelectorReport<RepeatMode, HTMLVideoElement>(
        ".html5-main-video",
        (el) => (el.loop ? RepeatMode.ONE : RepeatMode.NONE),
        RepeatMode.NONE,
        "repeatMode"
      ),
    shuffleActive: () => shuffleState,
  },
  // Can't be bothered to check this right now
  canSkipPrevious: () => true,
  canSkipNext: () => true,
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLButtonElement>(".ytp-play-button", (el) => el.click(), "setState");
    },
    skipPrevious: () => {
      querySelectorEventReport<HTMLVideoElement>(
        ".html5-main-video",
        (video) => {
          const link = querySelector<string, HTMLAnchorElement>(".ytp-title-link", (el) => el.search, "");
          if (!link) return;
          const previousButton = querySelector<HTMLButtonElement | null, HTMLButtonElement>(".ytp-prev-button", (el) => el, null);
          const list = new URLSearchParams(link).get("list");
          if (shuffleState && list) {
            const playlist = querySelector<HTMLElement | null, HTMLElement>(".ytp-playlist-menu-items", (el) => el, null);
            // Open the playlist menu and close it again to load the children
            if (!playlistLoaded && playlist?.children.length === 0) {
              querySelectorEventReport<HTMLButtonElement>(
                ".ytp-playlist-menu-button",
                (el) => {
                  el.click();
                  el.click();
                },
                "skipPrevious"
              );
              playlistLoaded = true;
            }
            (playlist?.children[Math.floor(Math.random() * playlist?.children.length)] as HTMLButtonElement).click();
          } else if (previousButton?.getAttribute("aria-disabled") !== "true" && video.currentTime <= 3) {
            previousButton?.click();
          } else {
            video.currentTime = 0;
          }
        },
        "skipPrevious"
      );
    },
    skipNext: () => {
      const link = querySelector<string, HTMLAnchorElement>(".ytp-title-link", (el) => el.search, "");
      if (!link) return;
      // Not using reporting querySelectors right now
      const list = new URLSearchParams(link).get("list");
      if (shuffleState && list) {
        const playlist = querySelector<HTMLElement | null, HTMLElement>(".ytp-playlist-menu-items", (el) => el, null);
        // Open the playlist menu and close it again to load the children
        if (!playlistLoaded && playlist?.children.length === 0) {
          querySelectorEventReport<HTMLButtonElement>(
            ".ytp-playlist-menu-button",
            (el) => {
              el.click();
              el.click();
            },
            "skipNext"
          );
          playlistLoaded = true;
        }
        (playlist?.children[Math.floor(Math.random() * playlist?.children.length)] as HTMLButtonElement).click();
      } else {
        querySelectorEventReport<HTMLButtonElement>(".ytp-next-button", (el) => el.click(), "skipNext");
      }
    },
    setPositionSeconds: (positionInSeconds: number) =>
      querySelectorEventReport<HTMLVideoElement>(".html5-main-video", (el) => (el.currentTime = positionInSeconds), "setPositionSeconds"),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>(
        ".html5-main-video",
        (el) => {
          el.muted = false;
          el.volume = volume / 100;
        },
        "setVolume"
      );
    },
    toggleRepeatMode: () => querySelectorEventReport<HTMLVideoElement>(".html5-main-video", (el) => (el.loop = !el.loop), "toggleRepeatMode"),
    toggleShuffleActive: () => {
      const link = querySelector<string, HTMLAnchorElement>(".ytp-title-link", (el) => el.search, "");
      if (!link) return;
      const list = new URLSearchParams(link).get("list");
      if (list) shuffleState = !shuffleState;
      else shuffleState = false;
    },
    setRating: null,
  },
};

export default site;
