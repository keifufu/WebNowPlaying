import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { InjectedUtils, createDefaultControls, createSiteInfo, notDisabled, ratingUtils, setRepeat } from "../utils";

const getContainer = (): (HTMLElement & { player: any }) | undefined => Utils.getContainer();
const getContainerThrow = () => {
  const container = getContainer();
  if (container) return container;
  throw new EventError();
};

const YouTube: Site = {
  init: null,
  ready: () => true,
  info: createSiteInfo({
    name: () => "YouTube",
    title: () => {
      const details = Utils.getVideoDetails();
      if (details?.title) return details.title;
      return "";
    },
    artist: () => {
      const details = Utils.getVideoDetails();
      if (details?.author) return details.author;
      return "";
    },
    album: () => {
      const details = Utils.getPlaylistDetails();
      if (details?.title) return details.title;
      return "";
    },
    cover: () => {
      const details = Utils.getVideoDetails();
      if (details.thumbnail?.thumbnails) {
        const url = Utils.findBiggestImage(details.thumbnail.thumbnails);
        if (url) return url.split("?")[0];
      }
      return "";
    },
    state: () => {
      const video = getContainer()?.querySelector<HTMLVideoElement>(".html5-main-video[src]");
      if (!video) return StateMode.STOPPED;
      return video.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => getContainer()?.player?.getCurrentTime() ?? 0,
    duration: () => getContainer()?.player?.getDuration() ?? 0,
    volume: () => (getContainer()?.player?.isMuted() ? 0 : getContainer()?.player?.getVolume() ?? 100),
    rating: () => {
      // TODO: in shorts, this gets the first #like-button button which is of the first reel, not the current one.
      // maybe see if the player api has something to get the rating

      let likeButton: HTMLButtonElement | null = null;
      const getLikeButton = (container: Element | null | undefined) => {
        if (!container) return;
        likeButton = container.querySelector("like-button-view-model button, #like-button button");
      };
      getLikeButton(getContainer()?.querySelector("ytd-player")?.parentElement?.parentElement);
      if (!likeButton) getLikeButton(getContainer());
      if (likeButton && (likeButton as HTMLButtonElement).getAttribute("aria-pressed") === "true") return 5;

      let dislikeButton: HTMLButtonElement | null = null;
      const getDislikeButton = (container: Element | null | undefined) => {
        if (!container) return;
        dislikeButton = container.querySelector("dislike-button-view-model button, #dislike-button button");
      };
      getDislikeButton(getContainer()?.querySelector("ytd-player")?.parentElement?.parentElement);
      if (!dislikeButton) getDislikeButton(getContainer());
      if (dislikeButton && (dislikeButton as HTMLButtonElement).getAttribute("aria-pressed") === "true") return 1;

      return 0;
    },
    repeat: () => {
      if (getContainer()?.querySelector<HTMLVideoElement>(".html5-main-video[src]")?.loop) return Repeat.ONE;
      const playlistRepeatButtonSvgPath = getContainer()?.querySelector("#playlist-action-menu path")?.getAttribute("d");
      const svgPathLoopPlaylist =
        "M20 14h2v5l-16.16.02 1.77 1.77L6.2 22.2 1.99 18l4.21-4.21 1.41 1.41-1.82 1.82L20 17v-3zM4 7l14.21-.02-1.82 1.82 1.41 1.41L22.01 6 17.8 1.79 16.39 3.2l1.77 1.77L2 5v6h2V7z";
      if (playlistRepeatButtonSvgPath === svgPathLoopPlaylist) return Repeat.ALL;
      return Repeat.NONE;
    },
    shuffle: () => getContainer()?.querySelectorAll("#playlist-action-menu button")[1]?.getAttribute("aria-pressed") === "true",
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          getContainerThrow().player.stopVideo();
          break;
        case StateMode.PAUSED:
          getContainerThrow().player.pauseVideo();
          break;
        case StateMode.PLAYING:
          getContainerThrow().player.playVideo();
          break;
      }
    },
    skipPrevious: () => {
      const chapters = Utils.findNearestChapters();
      if (chapters?.previous) return YouTube.events.setPosition?.(chapters.previous);
      getContainerThrow().player.previousVideo();
    },
    skipNext: () => {
      const chapters = Utils.findNearestChapters();
      if (chapters?.next) return YouTube.events.setPosition?.(chapters.next);
      getContainerThrow().player.nextVideo();
    },
    setPosition: (seconds) => {
      getContainerThrow().player.seekTo(seconds);
    },
    setVolume: (volume) => {
      getContainerThrow().player.setVolume(volume);
    },
    setRating: (rating) => {
      ratingUtils.likeDislike(YouTube, rating, {
        toggleLike: () => {
          let likeButton: HTMLButtonElement | null = null;
          const getLikeButton = (container: Element | null | undefined) => {
            if (!container) return;
            likeButton = container.querySelector("like-button-view-model button, #like-button button");
          };
          getLikeButton(getContainerThrow().querySelector("ytd-player")?.parentElement?.parentElement);
          if (!likeButton) getLikeButton(getContainerThrow());
          if (!likeButton) throw new EventError();
          (likeButton as HTMLButtonElement).click();
        },
        toggleDislike: () => {
          let dislikeButton: HTMLButtonElement | null = null;
          const getDislikeButton = (container: Element | null | undefined) => {
            if (!container) return;
            dislikeButton = container.querySelector("dislike-button-view-model button, #dislike-button button");
          };
          getDislikeButton(getContainerThrow().querySelector("ytd-player")?.parentElement?.parentElement);
          if (!dislikeButton) getDislikeButton(getContainerThrow());
          if (!dislikeButton) throw new EventError();
          (dislikeButton as HTMLButtonElement).click();
        },
      });
    },
    setRepeat: (repeat) => {
      const playlistRepeatButton = getContainerThrow().querySelector<HTMLButtonElement>("#playlist-action-menu button");
      if (playlistRepeatButton) {
        const currentRepeat = YouTube.info.repeat();
        if (currentRepeat === repeat) return;

        const repeatMap = {
          [Repeat.NONE]: 0,
          [Repeat.ALL]: 1,
          [Repeat.ONE]: 2,
        };

        setRepeat(playlistRepeatButton, repeatMap, currentRepeat, repeat);
      } else {
        const video = getContainerThrow().querySelector<HTMLVideoElement>(".html5-main-video[src]");
        if (!video) throw new EventError();
        video.loop = repeat === Repeat.ONE;
      }
    },
    setShuffle: (shuffle) => {
      if (YouTube.info.shuffle() === shuffle) return;
      const button = getContainerThrow().querySelectorAll<HTMLButtonElement>("#playlist-action-menu button")[1];
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(YouTube, {
      ratingSystem: RatingSystem.LIKE_DISLIKE,
      availableRepeat: (() => {
        const playlistRepeatButton = document.querySelector("#playlist-action-menu button");
        if (playlistRepeatButton) return Repeat.NONE | Repeat.ALL | Repeat.ONE;
        return Repeat.NONE | Repeat.ONE;
      })(),
      canSkipPrevious: notDisabled(getContainer()?.querySelector<HTMLButtonElement>(".ytp-prev-button, #navigation-button-up button")),
      canSkipNext: notDisabled(getContainer()?.querySelector<HTMLButtonElement>(".ytp-next-button, #navigation-button-down button")),
    }),
};

const Utils = {
  getContainer: (): any => {
    type T = (Element & { active: boolean }) | null;
    const previewPlayer: T = document.querySelector("ytd-video-preview");
    if (previewPlayer?.active) return previewPlayer;
    const shortsPlayer: T = document.querySelector("ytd-shorts");
    if (shortsPlayer?.active) return shortsPlayer;
    const miniPlayer: T = document.querySelector("ytd-miniplayer");
    if (miniPlayer?.active) return miniPlayer;
    const flexyPlayer: T = document.querySelector("ytd-watch-flexy");
    if (flexyPlayer?.active) return flexyPlayer;
    return null;
  },
  getVideoDetails: () => {
    let details;
    const container = Utils.getContainer();
    if (!container) return {};
    switch (container.localName) {
      case "ytd-video-preview":
        details = container?.videoPreviewFetchRequest?.result_?.videoDetails;
        break;
      case "ytd-miniplayer":
        details = container?.watchResponse?.playerResponse?.videoDetails;
        break;
      case "ytd-shorts":
      case "ytd-watch-flexy":
        details = container?.playerData?.videoDetails;
        break;
      default:
        details = document.querySelector<any>("ytd-app")?.data?.playerResponse?.videoDetails;
    }
    return details ?? {};
  },
  getPlaylistDetails: () => {
    return Utils.getContainer()?.querySelector("#playlist")?.data ?? {};
  },
  findChapterListInComments: () => {
    const currentURL = new URL(window.location.href);
    function getSeconds(el: HTMLAnchorElement) {
      if (!el.href) return null;
      const linkURL = new URL(el.href);
      if (linkURL.pathname === currentURL.pathname && linkURL.searchParams.get("v") === currentURL.searchParams.get("v")) {
        const timeString = linkURL.searchParams.get("t");
        if (timeString !== null) {
          const time = parseInt(timeString);
          if (!isNaN(time)) return time;
        }
      }
      return null;
    }
    const lists = Array.from(document.querySelectorAll("ytd-comment-thread-renderer > ytd-comment-renderer#comment"))
      .map((comment) =>
        Array.from(comment.querySelector("#content-text")?.children || [])
          .map((el) => getSeconds(el as HTMLAnchorElement))
          .filter((t) => t !== null),
      )
      .filter((list) => list.length > 2)
      .sort((a, b) => a.length - b.length) as number[][];
    return lists[0] || null;
  },
  findMarkerList: (panel: Element | null) => {
    if (!panel) return null;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("ytd-macro-markers-list-item-renderer > a"));
    const times = links
      .map((el) => {
        if (!el.href) return null;
        const linkURL = new URL(el.href);
        const timeString = linkURL.searchParams.get("t");
        if (timeString !== null) {
          const time = parseInt(timeString);
          if (!isNaN(time)) return time;
        }
        return null;
      })
      .filter((t) => t !== null) as number[];
    if (times.length > 2) return times;
    return null;
  },
  findChapterList: () => {
    const container = getContainer();
    if (container?.localName !== "ytd-watch-flexy" && container?.id !== "content") return null;
    // Check for a list of chapters in the description as they are the most reliable
    const descriptionChapters = document.querySelector(
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-macro-markers-description-chapters"]',
    );
    const descriptionChaptersList = Utils.findMarkerList(descriptionChapters);
    if (descriptionChaptersList) return descriptionChaptersList;
    // Check for a list of chapters in the comments
    const commentList = Utils.findChapterListInComments();
    if (commentList) return commentList;
    // Look for automatically generated chapters
    const autoChapters = document.querySelector(
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-macro-markers-auto-chapters"]',
    );
    const autoChaptersList = Utils.findMarkerList(autoChapters);
    if (autoChaptersList) return autoChaptersList;
    return null;
  },
  findNearestChapters: () => {
    if (!InjectedUtils.getSettings().YouTubeSkipChapters) return null;
    const timeList = Utils.findChapterList()?.sort((a, b) => a - b);
    if (!timeList) return null;
    const current = getContainer()?.querySelector<HTMLVideoElement>(".html5-main-video[src]")?.currentTime || 0;
    let next = null;
    let previous = null;
    for (let i = 0; i < timeList.length; i++) {
      if (timeList[i] > current) {
        next = timeList[i];
        break;
      }
      previous = current - timeList[i] <= 3 ? previous : timeList[i];
    }

    return { next, previous };
  },
  findBiggestImage: (images: { url: string; width: number; height: number }[]) => {
    if (images.length === 0) return null;
    const biggestImage = images.reduce((a, b) => {
      const aSize = a.width * a.height;
      const bSize = b.width * b.height;

      return bSize - aSize > 0 ? b : a;
    }, images[0]);

    return biggestImage.url;
  },
};

export default YouTube;
