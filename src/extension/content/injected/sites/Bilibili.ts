import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { InjectedUtils, _throw, createDefaultControls, createSiteInfo, notDisabled, ratingUtils } from "../utils";

/**
 * Bilibili adapter notes:
 * - Playback control relies on HTMLVideoElement API (stable across Bilibili player versions).
 * - Some controls (next/prev part, like, dislike) are DOM click based with selector fallbacks.
 * - Repeat: reliably supports Repeat.ONE via video.loop. Repeat.ALL is not reliably exposed.
 * - Shuffle: generally not a concept on bilibili video pages; returns false and setShuffle is best-effort (no-op).
 */

type AnyEl = Element & { [k: string]: any };

const q1 = <T extends Element = Element>(selectors: string, root: ParentNode = document): T | null => {
  try {
    return root.querySelector<T>(selectors);
  } catch {
    return null;
  }
};
const qAll = <T extends Element = Element>(selectors: string, root: ParentNode = document): T[] => {
  try {
    return Array.from(root.querySelectorAll<T>(selectors));
  } catch {
    return [];
  }
};

/** Try multiple selectors and return the first match */
const firstMatch = <T extends Element = Element>(selectors: string[], root: ParentNode = document): T | null => {
  for (const s of selectors) {
    const el = q1<T>(s, root);
    if (el) return el;
  }
  return null;
};

const Utils = {
  /** Player root container (best-effort) */
  getContainer: (): HTMLElement | null => {
    // New player (bpx) commonly has these wrappers
    const container = firstMatch<HTMLElement>([
      ".bpx-player-container",
      ".bpx-player-video-wrap",
      ".bpx-player-primary-area",
      "#bilibili-player",
      ".bilibili-player",
      "#playerWrap",
    ]);
    return container ?? null;
  },

  /** The actual HTML5 video element */
  getVideo: (): HTMLVideoElement | null => {
    const root = Utils.getContainer() ?? document;
    // Prefer video inside the player area
    const v = firstMatch<HTMLVideoElement>(
      [
        ".bpx-player-video-area video",
        ".bpx-player-container video",
        "#bilibili-player video",
        ".bilibili-player video",
        "video", // final fallback
      ],
      root,
    );
    return v ?? null;
  },

  /** Read bilibili page state (works on most video pages) */
  getInitialState: (): any => {
    const w = window as any;
    return w.__INITIAL_STATE__ ?? w.__NEXT_DATA__?.props?.pageProps ?? null;
  },

  /** Extract common "video details" from initial state with fallbacks */
  getVideoDetails: () => {
    const s = Utils.getInitialState();
    // Typical: __INITIAL_STATE__.videoData
    const videoData = s?.videoData ?? s?.videoInfo ?? null;

    // Fallbacks via DOM if state missing (e.g. partial pages / special layouts)
    const titleFromDom =
      q1<HTMLElement>("h1.video-title, h1.title, .video-title, .tit")?.textContent?.trim() ??
      q1<HTMLElement>('meta[name="title"]')?.getAttribute("content")?.trim() ??
      "";

    const authorFromDom =
      q1<HTMLElement>(".up-info-container .up-name, .up-info .name, a.up-name, .name .username")?.textContent?.trim() ??
      "";

    const coverFromDom =
      q1<HTMLMetaElement>('meta[property="og:image"]')?.content ??
      q1<HTMLMetaElement>('meta[itemprop="image"]')?.content ??
      "";

    const title = videoData?.title ?? titleFromDom ?? "";
    const author = videoData?.owner?.name ?? videoData?.staff?.[0]?.name ?? authorFromDom ?? "";
    const cover = videoData?.pic ?? coverFromDom ?? "";

    // For "album" (collection/season), try multiple known fields
    const collectionTitle =
      s?.mediaInfo?.title ??
      s?.seasonInfo?.title ??
      s?.episodeInfo?.season?.title ??
      s?.collectionInfo?.title ??
      s?.ugcSeason?.title ??
      "";

    return { title, author, cover, collectionTitle, raw: videoData };
  },

  /** Like / Dislike buttons (best-effort) */
  getRatingButtons: () => {
    // Bilibili is frequently A/B tested; rely on aria-label / title keywords + a few known classes.
    const likeButton =
      firstMatch<HTMLButtonElement | HTMLElement>([
        // common toolbar
        'button[aria-label*="点赞"]',
        'button[title*="点赞"]',
        'span[aria-label*="点赞"]',
        ".video-toolbar-left .like",
        ".toolbar-left .like",
        ".ops .like",
        ".video-like",
        // sometimes nested clickable
        ".video-toolbar-left .like *",
      ]) ?? null;

    const dislikeButton =
      firstMatch<HTMLButtonElement | HTMLElement>([
        'button[aria-label*="不喜欢"]',
        'button[title*="不喜欢"]',
        'span[aria-label*="不喜欢"]',
        ".video-toolbar-left .dislike",
        ".toolbar-left .dislike",
        ".video-dislike",
      ]) ?? null;

    return {
      likeButton: (likeButton as any) ?? null,
      dislikeButton: (dislikeButton as any) ?? null,
    };
  },

  /** Determine current rating state (best-effort) */
  getRatingState: () => {
    const { likeButton, dislikeButton } = Utils.getRatingButtons();

    const isPressed = (el: Element | null) => {
      if (!el) return false;
      const aria = el.getAttribute("aria-pressed");
      if (aria === "true") return true;
      // some bilibili buttons use active class
      const cls = (el as HTMLElement).classList;
      if (cls?.contains("active") || cls?.contains("on") || cls?.contains("is-active")) return true;
      return false;
    };

    return {
      liked: isPressed(likeButton),
      disliked: isPressed(dislikeButton),
    };
  },

  /** Next/Prev part (分P/合集) controls (best-effort) */
  getPartNavButtons: () => {
    const root = Utils.getContainer() ?? document;

    const prev =
      firstMatch<HTMLButtonElement | HTMLElement>(
        [
          ".bpx-player-ctrl-prev",
          ".bpx-player-ctrl-btn.bpx-player-ctrl-prev",
          ".bilibili-player-video-btn-prev",
          ".bilibili-player-video-btn-prev-video",
          ".squirtle-video-prev", // older layouts
          ".video-prev",
        ],
        root,
      ) ?? null;

    const next =
      firstMatch<HTMLButtonElement | HTMLElement>(
        [
          ".bpx-player-ctrl-next",
          ".bpx-player-ctrl-btn.bpx-player-ctrl-next",
          ".bilibili-player-video-btn-next",
          ".bilibili-player-video-btn-next-video",
          ".squirtle-video-next",
          ".video-next",
        ],
        root,
      ) ?? null;

    return { prev: (prev as any) ?? null, next: (next as any) ?? null };
  },
};

const getContainer = (): HTMLElement | undefined => Utils.getContainer() ?? undefined;

const Bilibili: Site = {
  debug: { getContainer, Utils },

  init: null,

  ready: () => {
    // video exists and has a src (or is otherwise usable)
    const v = Utils.getVideo();
    return !!v;
  },

  info: createSiteInfo({
    name: () => "Bilibili",

    title: () => Utils.getVideoDetails().title ?? "",

    artist: () => Utils.getVideoDetails().author ?? "",

    album: () => Utils.getVideoDetails().collectionTitle ?? "",

    cover: () => {
      const cover = Utils.getVideoDetails().cover ?? "";
      // Normalize //i0.hdslb.com/... to https://...
      if (cover.startsWith("//")) return `https:${cover}`;
      return cover;
    },

    state: () => {
      const v = Utils.getVideo();
      if (!v) return StateMode.STOPPED;
      return v.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },

    position: () => Utils.getVideo()?.currentTime ?? 0,

    duration: () => Utils.getVideo()?.duration ?? 0,

    volume: () => {
      const v = Utils.getVideo();
      if (!v) return 0;
      if ((v as any).muted) return 0;
      // map 0..1 -> 0..100
      return Math.round((v.volume ?? 0) * 100);
    },

    rating: () => {
      // Keep same semantic as your YouTube adapter:
      // Like -> 5, Dislike -> 1, Neutral -> 0
      const { liked, disliked } = Utils.getRatingState();
      if (liked) return 5;
      if (disliked) return 1;
      return 0;
    },

    repeat: () => {
      const v = Utils.getVideo();
      if (v?.loop) return Repeat.ONE;
      // Bilibili doesn’t have a stable "repeat all" concept on video pages
      return Repeat.NONE;
    },

    shuffle: () => false,
  }),

  events: {
    setState: (state) => {
      const v = Utils.getVideo();
      if (!v) throw new EventError();

      switch (state) {
        case StateMode.STOPPED:
          // Best-effort "stop": pause + reset time to 0
          v.pause();
          try {
            v.currentTime = 0;
          } catch {
            // ignore
          }
          break;

        case StateMode.PAUSED:
          v.pause();
          break;

        case StateMode.PLAYING:
          // play() returns a promise in modern browsers; ignore rejection here
          // (autoplay policy / user gesture can reject)
          void v.play();
          break;
      }
    },

    skipPrevious: () => {
      // If you want chapter-skip like YouTube, you’d need to parse Bilibili chapter data;
      // this adapter focuses on robust prev/next part navigation.
      const { prev } = Utils.getPartNavButtons();
      if (prev) {
        (prev as HTMLElement).click();
        return;
      }
      // fallback: seek to start
      const v = Utils.getVideo();
      if (!v) throw new EventError();
      v.currentTime = 0;
    },

    skipNext: () => {
      const { next } = Utils.getPartNavButtons();
      if (next) {
        (next as HTMLElement).click();
        return;
      }
      throw new EventError();
    },

    setPosition: (seconds) => {
      const v = Utils.getVideo();
      if (!v) throw new EventError();
      v.currentTime = seconds;
    },

    setVolume: (volume) => {
      const v = Utils.getVideo();
      if (!v) throw new EventError();
      // map 0..100 -> 0..1
      const vol = Math.max(0, Math.min(100, volume)) / 100;
      v.volume = vol;
      (v as any).muted = vol === 0;
    },

    setRating: (rating) => {
      ratingUtils.likeDislike(Bilibili, rating, {
        toggleLike: () => {
          const { likeButton } = Utils.getRatingButtons();
          if (!likeButton) throw new EventError();
          (likeButton as HTMLElement).click();
        },
        toggleDislike: () => {
          const { dislikeButton } = Utils.getRatingButtons();
          if (!dislikeButton) throw new EventError();
          (dislikeButton as HTMLElement).click();
        },
      });
    },

    setRepeat: (repeat) => {
      const v = Utils.getVideo();
      if (!v) throw new EventError();
      // Reliable: only Repeat.ONE via loop
      v.loop = repeat === Repeat.ONE;
      // Repeat.ALL not reliably supported on bilibili video pages
    },

    setShuffle: (_shuffle) => {
      // No stable shuffle concept for bilibili web video pages; no-op
      return;
    },
  },

  controls: () =>
    createDefaultControls(Bilibili, {
      ratingSystem: RatingSystem.LIKE_DISLIKE,
      availableRepeat: Repeat.NONE | Repeat.ONE,
      canSkipPrevious: (() => {
        const { prev } = Utils.getPartNavButtons();
        // if no prev button, we still can "skip previous" (seek to 0)
        return true && notDisabled(prev as any);
      })(),
      canSkipNext: (() => {
        const { next } = Utils.getPartNavButtons();
        return notDisabled(next as any);
      })(),
    }),
};

export default Bilibili;