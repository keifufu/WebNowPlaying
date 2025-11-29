import { convertTimeToSeconds, getMediaSessionCover } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo, ratingUtils, setRepeat } from "../utils";

const getPlayer = () => document.querySelector<any>("ytmusic-player-bar")?.playerApi;

const YouTubeMusic: Site = {
  debug: {
    getPlayer,
  },
  init: null,
  ready: () => getPlayer()?.isReady(),
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
    // `getPlayer()?.getDuration()` and `getPlayer()?.getProgressState().duration`
    // report incorrectly for premium users.
    // see https://github.com/keifufu/WebNowPlaying/issues/29
    duration: () => {
      const timeInfo = document.querySelector<HTMLElement>(".time-info")?.innerText ?? "0:00 / 0:00";
      const duration = timeInfo.trim().split(" / ")[1];
      return convertTimeToSeconds(duration);
    },
    volume: () => getPlayer()?.getVolume() ?? 100,
    rating: () => {
      const likeStatus = document.querySelector('.middle-controls-buttons #like-button-renderer')?.getAttribute('like-status');
      if (likeStatus === 'LIKE') return 5;
      if (likeStatus === 'DISLIKE') return 1;
      return 0; // status 'INDIFFERENT', aka no rating
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
          _throw(getPlayer()?.stopVideo)();
          break;
        case StateMode.PAUSED:
          _throw(getPlayer()?.pauseVideo)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.playVideo)();
          break;
      }
    },
    skipPrevious: () => _throw(getPlayer()?.previousVideo)(),
    skipNext: () => _throw(getPlayer()?.nextVideo)(),
    setPosition: (seconds) => _throw(getPlayer()?.seekTo)(seconds),
    setVolume: (volume) => _throw(getPlayer()?.setVolume)(volume),
    setRating: (rating) => {
      ratingUtils.likeDislike(YouTubeMusic, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>('.middle-controls-buttons #like-button-renderer #button-shape-like button');
          if (!button) throw new EventError();
          button.click();
        },
        toggleDislike: () => {
          const button = document.querySelector<HTMLButtonElement>('.middle-controls-buttons #like-button-renderer #button-shape-dislike button');
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
