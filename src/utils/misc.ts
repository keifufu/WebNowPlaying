export function getMediaSessionCover() {
  if (!navigator.mediaSession.metadata?.artwork) return "";
  const biggestImage = navigator.mediaSession.metadata.artwork.reduce((a, b) => {
    const aSize = parseInt(a.sizes?.split("x")[1] || "0");
    const bSize = parseInt(b.sizes?.split("x")[1] || "0");

    return bSize - aSize > 0 ? b : a;
  }, navigator.mediaSession.metadata.artwork[0]);

  return biggestImage.src;
}

// Converts every word in a string to start with a capital letter
export function capitalize(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

// Convert seconds to a time string like "1:23", "4:03:54"...
function pad(num: number, size: number) {
  return num.toString().padStart(size, "0");
}
export function timeInSecondsToString(time: number) {
  if (isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  if (minutes < 60) {
    return `${minutes}:${pad(seconds, 2)}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${pad(remainingMinutes, 2)}:${pad(seconds, 2)}`;
  }
}

export function isVersionOutdated(currentVersion: string, latestVersion: string) {
  // The version is major.minor.patch, compare version against what the extension knows is the latest version
  // C# actually gives us a version with 4 numbers, but this just ignores the last one
  const [major, minor, patch] = latestVersion.split(".").map((v) => parseInt(v));
  const [major2, minor2, patch2] = currentVersion.split(".").map((v) => parseInt(v));
  if (major2 < major || (major2 === major && minor2 < minor) || (major2 === major && minor2 === minor && patch2 < patch)) return true;
  else return false;
}

export async function getVersionFromGithub(gh: string) {
  try {
    const releaseApiLink = `https://api.github.com/repos/${gh}/releases?per_page=1`;
    const response = await fetch(releaseApiLink);
    if (response.ok) {
      const json = await response.json();
      let tag = json[0].tag_name;
      if (!tag) return "Error";
      if (tag.startsWith("v")) tag = tag.slice(1);
      return tag;
    }
    return "Error";
  } catch {
    return "Error";
  }
}

export const convertTimeToSeconds = (time: string) => {
  const arr = time.split(":");

  if (arr.length >= 2) {
    const seconds = parseInt(arr[arr.length - 1]) ?? 0;
    const minutes = (parseInt(arr[arr.length - 2]) ?? 0) * 60;
    const hours = (arr.length > 2 ? parseInt(arr[0]) ?? 0 : 0) * 3600;
    return hours + minutes + seconds;
  }

  return 0;
};

export function getExtensionVersion() {
  if (typeof chrome !== "undefined" && typeof chrome.runtime?.getManifest === "function") {
    return chrome.runtime.getManifest().version;
  }

  return "0.0.0";
}

export function randomToken(length = 24) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomChars = Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length)));
  return randomChars.join("");
}
