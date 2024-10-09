# Changelog

Full changelog available via [Github Commits](https://github.com/keifufu/WebNowPlaying/commits/main)

## v3.1.0

- Updated Spotify
- Updated Apple Music
- Improved active player calculation
- Fixed issues with v3 adapters
- Fixed "standardize featuring" option
- Fixed players sometimes disconnecting for no apparent reason
- Simplified reconnection logic to let browsers handle reconnects
- Added connection help message for when adapters fail to connect

## v3.0.1

- No longer forces users to grant missing permissions

## v3.0.0

- Improved support for all sites \*¹
- Added support for v3 adapters
  - Events now return event results indicating whether they succeeded or failed
  - Adapters get sent all players instead of just the active one
  - Events can be sent to any player instead of just the active one
  - Players report their available repeat modes
  - Repeat mode can now be set invididually instead of toggled
  - Shuffle can now be set instead of toggled
- Ask for permissions in the settings interface when browsers didn't prompt the user
- non-v3 adapters will toggle repeat modes in a consistent order (NONE -> ALL -> ONE), skipping unavailable ones
- Optimization / performance improvements
- Removed manual and automatic reporting functionality
- Added CLI adapter
- Updated the settings interface
- Miscellaneous bug fixes and improvements

\*¹ See https://wnp.keifufu.dev/supported-sites

## v2.0.10

- Added support for vk.com

## v2.0.9

- Fixed Apple Music Duration

## v2.0.8

- Disabled reports as they are currently useless

## v2.0.7

- Fixed YouTube Music covers

## v2.0.6

- Updated links to new documentation
- Remove " - Topic" from artists

## v2.0.5

- Properly fix what should have been fixed in 2.0.3 and 2.0.4

## v2.0.4

- Fixed Spotify rating

## v2.0.3

- Now always skips to the previous song instead of the beginning of the song

## v2.0.2

- Added support for Kick

## v2.0.1

- Added support for Yandex Music

## v2.0.0

- Added controls for Native APIs
- Updated communication protocol to revision 2
- Minor bug fixes

## v1.3.1

- Better supports for Jellyfin covers
- "Unsupported Sites" can no longer run on disabled supported sites
- Fix some issues with the new Settings UI

## v1.3.0

- Updated the settings UI to allow for more control over the adapters connection state
- Added support for Jellyfin
- Added support for Invidious
- Added OBS adapter
- Fixed YouTube music cover not returning sometimes
- Fixed YouTube and Twitch volume being discarded after switching videos/streams
- Improved re-connection logic, especially on Firefox
- Switched to using local storage instead of synced storage. This means extension settings will not sync across browsers and they will have reset after updating to this version
- Sends media info right after connecting to a adapter, instead of once something updated

## v1.2.3

- Various small bug fixes

## v1.2.2

- Update settings UI
- Fix 'Unsupported Websites' returning a poorly formatted cover URL
- Other minor fixes

## v1.2.1

- Fixed generic site initializing more than once

## v1.2.0

- Added Netflix support
- Added chapter skipping on YouTube, (Settings UI -> Supported Sites -> YouTube -> Settings Icon) to enable
- Fixed YouTube Music volume not setting correctly
- Added button in settings UI to 'Apply and Reload'
- Minor bug fixes

## v1.1.0

- Added support for Navidrome
- Added support for Radio Addict
- Added support for YouTube Shorts
- Now opens one websocket per adapter instead of one per adapter per tab
- Enabled version checking
- Show authors next to adapter name
- Various other fixes

## v1.0.1

- Fixed a memory leak and various other bug fixes.

## v1.0.0

- Initial Release
