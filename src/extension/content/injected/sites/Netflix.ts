import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const Netflix: Site = {
  init: null,
  ready: () => !!document.querySelector("video")?.duration,
  info: createSiteInfo({
    name: () => "Netflix",
    title: () => {
      const data = Utils.getInfo()?.seasonData;
      if (data) {
        if (data.type === "show" && data.episode.title) {
          let { title } = data.episode;
          if (data.season && [...data.season.episodes].length > 1 && data.season.shortName)
            title += ` (${data.season.shortName}E${data.episode.seq})`;

          return String(title);
        }
        return String(data.title);
      }
      return "";
    },
    artist: () => {
      const data = Utils.getInfo()?.seasonData;
      if (data && data.type === "show" && data.episode.title) return String(data.title);
      return "Netflix";
    },
    album: () => {
      const data = Utils.getInfo()?.seasonData;
      if (data && data.type === "show" && data.episode.title && data.season.longName) return String(data.season.longName);
      return "Netflix";
    },
    cover: () => {
      if (Utils.getInfo()?.metadata._metadata.video) {
        const { artwork, boxart, storyart } = Utils.getInfo().metadata._metadata.video;
        let art;
        if (artwork.length > 0) art = artwork;
        else if (storyart.length > 0) art = storyart;
        else art = boxart;
        art = [...art].reduce((prev, cur) => (prev.w * prev.h > cur.w * cur.h ? prev : cur));
        return String(art.url) || "";
      }
      return "";
    },
    state: () => {
      const video = document.querySelector("video");
      if (!video) return StateMode.STOPPED;
      return video.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => document.querySelector("video")?.currentTime ?? 0,
    duration: () => document.querySelector("video")?.duration ?? 0,
    volume: () => {
      const video = document.querySelector("video");
      if (!video) return 100;
      return video.muted ? 0 : video.volume * 100;
    },
    rating: () => 0,
    repeat: () => Repeat.NONE,
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          video.pause();
          break;
        case StateMode.PLAYING:
          video.play();
          break;
      }
    },
    skipPrevious: () => {
      const data = Utils.getInfo()?.navData;
      if (data?.prevId && data?.currId) {
        window.location.href = window.location.href.replace(data.currId, data.prevId);
      } else {
        throw new EventError();
      }
    },
    skipNext: () => {
      const data = Utils.getInfo()?.navData;
      if (data?.nextId && data?.currId) {
        window.location.href = window.location.href.replace(data.currId, data.nextId);
      } else {
        throw new EventError();
      }
    },
    setPosition: (seconds) => {
      const seek = Utils.getPlayer()?.seek;
      if (typeof seek === "function") seek(seconds * 1000);
      else throw new EventError();
    },
    setVolume: (volume) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      video.muted = false;
      video.volume = volume / 100;
    },
    setRating: null,
    setRepeat: null,
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Netflix, {
      canSkipPrevious: (() => {
        const data = Utils.getInfo()?.navData;
        return !!data?.prevId && !!data?.currId;
      })(),
      canSkipNext: (() => {
        const data = Utils.getInfo()?.navData;
        return !!data?.nextId && !!data?.currId;
      })(),
    }),
};

const Utils = {
  getContext: () => (window as any)?.netflix?.appContext,
  getAPI: () => Utils.getContext().getState?.()?.playerApp?.getAPI?.(),
  getSessionId: () => {
    let sessionId = null;
    for (const id of Utils.getAPI()?.videoPlayer?.getAllPlayerSessionIds?.() ?? []) {
      if (id.startsWith("watch-")) {
        sessionId = id;
        break;
      }
    }
    return sessionId;
  },
  getPlayer: () => Utils.getAPI()?.videoPlayer?.getVideoPlayerBySessionId?.(Utils.getSessionId()),
  getMetadata: (): any => {
    try {
      return Object.values(Utils.getContext()?.getPlayerApp?.()?.getState?.()?.videoPlayer?.videoMetadata).find((data: any) => "_video" in data);
    } catch {
      return null;
    }
  },
  getSeasonData: () => {
    const metadata = Utils.getMetadata()?._metadata?.video;
    if (metadata?.seasons) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const getEpisode = (season: any) => [...season?.episodes].find((episode) => episode?.id === metadata?.currentEpisode);
      // eslint-disable-next-line no-unsafe-optional-chaining
      const season = [...metadata?.seasons].find(getEpisode);
      return {
        type: metadata?.type,
        title: metadata?.title,
        episode: getEpisode(season),
        season,
        seasons: metadata?.seasons,
      };
    } else {
      return {
        type: metadata?.type,
        title: metadata?.title,
        episode: null,
        season: null,
        seasons: [],
      };
    }
  },
  getNavData: () => {
    const data = Utils.getSeasonData();
    if (data?.season) {
      const { episodes, seq } = data.season;
      const seasons = [...data.seasons];
      const eIndex = [...episodes].findIndex((episode) => episode.id === data.episode.id);
      const currId = [...episodes][eIndex].id;
      let prevId;
      let nextId;
      if (eIndex > 0) {
        prevId = [...episodes][eIndex - 1]?.id;
      } else if (seq > 1) {
        const prevEpisodes = [...seasons[seq - 2].episodes];
        prevId = prevEpisodes[prevEpisodes.length - 1]?.id;
      }
      if (eIndex === episodes.length - 1 && seq < seasons.length) nextId = [...seasons[seq].episodes][0]?.id;
      else nextId = [...episodes][eIndex + 1]?.id;

      return { prevId, currId, nextId };
    }
    return {};
  },
  getInfo: () => ({
    seasonData: Utils.getSeasonData(),
    navData: Utils.getNavData(),
    metadata: Utils.getMetadata(),
    isPlayerReady: Utils.getPlayer()?.isReady?.() || false,
  }),
};

export default Netflix;
