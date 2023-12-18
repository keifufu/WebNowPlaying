import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, ratingUtils, setRepeat } from "../utils";

const getPlayer = () => document.querySelector<any>("ytmusic-player-bar")?.playerApi;
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const YouTubeMusic: Site = {
  init: null,
  ready: () => !!navigator.mediaSession.metadata && !!document.querySelector("video"),
  info: createSiteInfo({
    name: () => "YouTube Music",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () =>
      // This won't return the highest quality cover, but it's good enough for now.
      // Check the git history for how we used to do it. I changed it back to this
      // because the cover would flicker and I couldn't be bothered to fix it :3
      getMediaSessionCover().split("?")[0],
    state: () => {
      const state = getPlayer()?.getPlayerState();
      switch (state) {
        case 1:
          return StateMode.PLAYING;
        case 2:
          return StateMode.PAUSED;
        default:
          return StateMode.STOPPED;
      }
    },
    position: () => getPlayer()?.getCurrentTime() ?? 0,
    duration: () => getPlayer()?.getDuration() ?? 0,
    volume: () => getPlayer()?.getVolume() ?? 100,
    rating: () => {
      const likeButtonPressed = document.querySelectorAll(".middle-controls-buttons yt-button-shape")[1]?.getAttribute("aria-pressed") === "true";
      if (likeButtonPressed) return 5;
      const dislikeButtonPressed = document.querySelector(".middle-controls-buttons yt-button-shape")?.getAttribute("aria-pressed") === "true";
      if (dislikeButtonPressed) return 1;
      return 0;
    },
    repeat: () => {
      const state = document.querySelector("ytmusic-player-bar")?.getAttribute("repeat-mode");
      switch (state) {
        case "ONE":
          return Repeat.ONE;
        case "ALL":
          return Repeat.ALL;
        default:
          return Repeat.NONE;
      }
    },
    // There is no shuffle state
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          getPlayerThrow().stopVideo();
          break;
        case StateMode.PAUSED:
          getPlayerThrow().pauseVideo();
          break;
        case StateMode.PLAYING:
          getPlayerThrow().playVideo();
          break;
      }
    },
    skipPrevious: () => {
      getPlayerThrow().previousVideo();
    },
    skipNext: () => {
      getPlayerThrow().nextVideo();
    },
    setPosition: (seconds) => {
      getPlayerThrow().seekTo(seconds);
    },
    setVolume: (volume) => {
      getPlayerThrow().setVolume(volume);
    },
    setRating: (rating) => {
      ratingUtils.likeDislike(YouTubeMusic, rating, {
        toggleLike: () => {
          const button = document.querySelectorAll<HTMLButtonElement>(".middle-controls-buttons button")[1];
          if (!button) throw new EventError();
          button.click();
        },
        toggleDislike: () => {
          const button = document.querySelector<HTMLButtonElement>(".middle-controls-buttons button");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const currentRepeat = YouTubeMusic.info.repeat();
      if (currentRepeat === repeat) return;
      const button = document.querySelector<HTMLButtonElement>(".repeat");
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: () => {
      // YTM shuffle is weird, clicking the shuffle button just shuffles the existing playlist
      const button = document.querySelector<HTMLButtonElement>(".shuffle");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(YouTubeMusic, {
      ratingSystem: RatingSystem.LIKE_DISLIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default YouTubeMusic;
