import { NetflixInfo, YouTubeVideoDetails, VKInfo, StateMode, RepeatMode } from "../types";

window.addEventListener("message", (e: any) => {
  if (e.data.type === "wnp-message") {
    switch (e.data.event) {
      case "getYouTubeInfo":
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: {
              videoDetails: YouTube.getVideoDetails(),
              playlistDetails: findKey(YouTube.getContainer()?.querySelector("#playlist"), "data"),
              containerLocalName: YouTube.getContainer()?.localName,
            },
          },
          "*"
        );
        break;
      case "setYouTubeVolume":
        (YouTube.getContainer() as any)?.player?.setVolume?.(e.data.data);
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "getYouTubeMusicVolume":
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: (document.querySelector("ytmusic-player-bar") as any)?.playerApi_?.getVolume?.(),
          },
          "*"
        );
        break;
      case "setYouTubeMusicVolume":
        (document.querySelector("ytmusic-player-bar") as any)?.playerApi_?.setVolume?.(e.data.data);
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "seekNetflix":
        Netflix.getPlayer()?.seek?.(e.data.data * 1000);
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "getNetflixInfo":
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: Netflix.getInfo(),
          },
          "*"
        );
        break;
      case "getVKInfo":
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: VK.getInfo(),
          },
          "*"
        );
        break;
      case "setVKState":
        VK.setState(e.data.data);
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "skipVKPrevious":
        VK.skipPrevious();
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "skipVKNext":
        VK.skipNext();
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "setVKPosition":
        VK.setPosition(e.data.data);
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "setVKVolume":
        VK.setVolume(e.data.data);
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "toggleVKRepeatMode":
        VK.toggleRepeatMode();
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      case "toggleVKShuffleActive":
        VK.toggleShuffleActive();
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
        break;
      default:
        window.postMessage(
          {
            id: e.data.id,
            type: "wnp-response",
            value: null,
          },
          "*"
        );
    }
  }
});

function findKey(obj: any, key: string): any {
  if (typeof obj !== "object" || obj === null) return null;
  const value = typeof obj.get === "function" ? obj.get(key) : obj[key];
  if (value !== undefined && value !== null) return value;
  // Keys can be 'a.b.c' to find nested objects
  const keys = key.split(".");
  let prop = obj;
  for (const key of keys) {
    prop = prop?.[key];
    if (!prop) break;
  }
  if (prop) return prop;
  return null;
}

const YouTube = {
  getContainer: (): Element | null => {
    const previewPlayer = document.querySelector("ytd-video-preview");
    if (findKey(previewPlayer, "active")) return previewPlayer;
    const shortsPlayer = document.querySelector("ytd-shorts");
    if (findKey(shortsPlayer, "active")) return shortsPlayer;
    const miniPlayer = document.querySelector("ytd-miniplayer");
    if (findKey(miniPlayer, "active")) return miniPlayer;
    const flexyPlayer = document.querySelector("ytd-watch-flexy");
    if (findKey(flexyPlayer, "active")) return flexyPlayer;
    return null;
  },
  getVideoDetails: (): YouTubeVideoDetails => {
    let details;
    const container = YouTube.getContainer();
    if (!container) return {};
    switch (container.localName) {
      case "ytd-video-preview":
        details = findKey(container, "videoPreviewFetchRequest.result_.videoDetails");
        break;
      case "ytd-miniplayer":
        details = findKey(container, "watchResponse.playerResponse.videoDetails");
        break;
      case "ytd-shorts":
      case "ytd-watch-flexy":
        details = findKey(container, "playerData.videoDetails");
        break;
      default:
        details = findKey(document.querySelector("ytd-app"), "data.playerResponse.videoDetails");
    }
    return details ?? {};
  },
};

const Netflix = {
  getContext: () => (window as any)?.netflix?.appContext,
  getAPI: () => Netflix.getContext().getState?.()?.playerApp?.getAPI?.(),
  getSessionId: () => {
    let sessionId = null;
    for (const id of Netflix.getAPI()?.videoPlayer?.getAllPlayerSessionIds?.() ?? []) {
      if (id.startsWith("watch-")) {
        sessionId = id;
        break;
      }
    }
    return sessionId;
  },
  getPlayer: () => Netflix.getAPI()?.videoPlayer?.getVideoPlayerBySessionId?.(Netflix.getSessionId()),
  getMetadata: (): any => {
    try {
      return Object.values(Netflix.getContext()?.getPlayerApp?.()?.getState?.()?.videoPlayer?.videoMetadata).find((data: any) => "_video" in data);
    } catch {
      return null;
    }
  },
  getSeasonData: (): any | null => {
    const metadata = Netflix.getMetadata()?._metadata?.video;
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
    const data = Netflix.getSeasonData();
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
  getInfo: (): NetflixInfo => ({
    seasonData: Netflix.getSeasonData(),
    navData: Netflix.getNavData(),
    metadata: Netflix.getMetadata(),
    isPlayerReady: Netflix.getPlayer()?.isReady?.() || false,
  }),
};

const VK = {
  getPlayer: () => (window as any)?.getAudioPlayer() ?? null,
  getInfo(): VKInfo {
    let player = VK.getPlayer();
    return {
      state: !player?.getCurrentPlaylist() ? StateMode.STOPPED : player.isPlaying() ? StateMode.PLAYING : StateMode.PAUSED,
      title: VK.unescape(player?.stats?.currentAudio?.title ?? ""),
      artist: VK.unescape(player?.stats?.currentAudio?.performer ?? ""),
      cover: player?.stats?.currentAudio?.coverUrl_p ?? "",
      duration: player?.stats?.currentAudio?.duration ?? 0,
      position: Math.floor((player?.getCurrentProgress() ?? 0) * (player?.stats?.currentAudio?.duration ?? 0)),
      volume: Math.floor((player?.getVolume() ?? 1) ** (1 / 3) * 100),
      repeatMode: player?.isRepeatAll() ? RepeatMode.ALL : player?.isRepeatCurrentAudio() ? RepeatMode.ONE : RepeatMode.NONE,
      shuffleActive: player?.getPlaylistQueue()?.shuffled ?? false,

      isPlayerReady: player !== null,
    };
  },
  setState(state: StateMode) {
    switch (state) {
      case StateMode.PAUSED:
        return VK.getPlayer()?.pause();
      case StateMode.STOPPED:
        return VK.getPlayer()?.stop();
      case StateMode.PLAYING:
        return VK.getPlayer()?.play();
    }
  },
  skipPrevious: () => VK.getPlayer()?.playPrev(),
  skipNext: () => VK.getPlayer()?.playNext(),
  setPosition: (pos: number) => VK.getPlayer()?.seekToTime(pos),
  setVolume: (vol: number) => VK.getPlayer()?.setVolume((vol / 100) ** 3),
  toggleRepeatMode() {
    let player = VK.getPlayer();
    if (player?.isRepeatAll()) return player.toggleRepeatCurrentAudio();
    if (player?.isRepeatCurrentAudio()) return player.toggleRepeatCurrentAudio();
    return player?.toggleRepeatAll();
  },
  toggleShuffleActive() {
    let player = VK.getPlayer();
    if (player?.getPlaylistQueue()?.shuffled) return player?.getPlaylistQueue()?.shuffle();
    return player?.getPlaylistQueue()?.shuffle(Math.random());
  },
  // https://stackoverflow.com/questions/18106164/unescape-apostrophe-39-in-javascript
  unescape: (input: string): string => new DOMParser().parseFromString(input, "text/html").querySelector("html")!.textContent!,
};
