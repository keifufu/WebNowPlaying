# WebNowPlaying-Redux
A browser extension that provides information and controls for media playing in the browser to external adapters.  
It detects information about the media being played, such as the title, artist, album, and more.  
This information can be utilized by external adapters to manage the media, including actions like pausing, skipping, adjusting the volume, and more.

## Adapters
- [WebNowPlaying-Redux-Rainmeter](https://github.com/keifufu/WebNowPlaying-Redux-Rainmeter) by [keifufu](https://github.com/keifufu), [tjhrulz](https://github.com/tjhrulz/)
- [WebNowPlaying-Redux-Macro-Deck](https://github.com/jbcarreon123/WebNowPlaying-Redux-Macro-Deck) by [jbcarreon123](https://github.com/jbcarreon123)
- Want to create or submit your own adapter? Click [here](https://github.com/keifufu/WebNowPlaying-Redux/blob/main/CreatingAdapters.md)!

## Supported websites
- Apple Music
- Bandcamp
- Deezer
- Pandora
- Plex
- SoundCloud
- Spotify
- Tidal
- Twitch
- YouTube
- Youtube Embeds
- YouTube Music
- Any website with a video or audio element might work, you can enable them in the options (Click the extension icon)

I will consider adding other websites where there is demand.  
Please keep in mind that I can't easily develop for paid services.

## Installing
Firefox: [Mozilla Addon Store](https://addons.mozilla.org/en-US/firefox/addon/webnowplaying-redux)  
Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/webnowplaying-redux/jfakgfcdgpghbbefmdfjkbdlibjgnbli)  
Edge, Opera, etc. also use the Chrome Web Store

### If you use an adblocker

Some adblockers block requests to localhost, which breaks this plugin. To fix this, add the following to your adblock's filter list: 

```
@@||localhost^8974
@@||localhost^8698
```

Here's where to find your filter list:
 - Brave - brave://settings/shields/filters
 - Ublock Origin
     - Open the extension settings (different on each browser)
     - Go to the 'My Filters' tab

## TODO
- Section skipping on Youtube
- Netflix support
- Volume support for: Deezer, Pandora, Tidal

## Building from source
- Install [Node.js](https://nodejs.org)
- Install pnpm globally with `npm i -g pnpm`
- Run `pnpm i`
- Run `pnpm run build`
- The output will be in /dist