import { DEFAULT_UPDATE_FREQUENCY } from "../../../utils/settings";
import { RatingSystem, RepeatMode, Site, StateMode, VKInfo } from "../../types";
import { ContentUtils } from "../utils";

let currentVKInfo: VKInfo | null = null;

const site: Site = {
  match: () => window.location.hostname === "vk.com",
  init() {
    setInterval(async () => {
      const vkInfo = await ContentUtils.getVKInfo();
      if (vkInfo) currentVKInfo = vkInfo;
    }, DEFAULT_UPDATE_FREQUENCY / 2);
  },
  ready: () => currentVKInfo?.isPlayerReady ?? false,
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "VK",
    state: () => currentVKInfo?.state ?? StateMode.STOPPED,
    title: () => currentVKInfo?.title ?? "",
    artist: () => currentVKInfo?.artist ?? "",
    album: () => "", // there is no way to get album
    coverUrl: () => currentVKInfo?.cover ?? "",
    durationSeconds: () => currentVKInfo?.duration ?? 0,
    positionSeconds: () => currentVKInfo?.position ?? 0,
    volume: () => currentVKInfo?.volume ?? 100,
    rating: () => 0,
    repeatMode: () => currentVKInfo?.repeatMode ?? RepeatMode.NONE,
    shuffleActive: () => currentVKInfo?.shuffleActive ?? false,
  },
  canSkipPrevious: () => true,
  canSkipNext: () => true,
  events: {
    setState: (state) => ContentUtils.setVKState(state),
    skipPrevious: () => ContentUtils.skipVKPrevious(),
    skipNext: () => ContentUtils.skipVKNext(),
    setPositionSeconds: (time) => ContentUtils.setVKPosition(time),
    setPositionPercentage: null,
    setVolume: (volume) => ContentUtils.setVKVolume(volume),
    toggleRepeatMode: () => ContentUtils.toggleVKRepeatMode(),
    toggleShuffleActive: () => ContentUtils.toggleVKShuffleActive(),
    setRating: null,
  },
};

export default site;
