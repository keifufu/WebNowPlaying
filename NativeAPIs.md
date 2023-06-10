# Using Native APIs
This allows adapters to use your operating systems APIs to get media info from desktop apps.  
Keep in mind that not all WebNowPlaying features are supported by these apps, as some might not provide controls like skipping, seeking, etc.

**Note**: Browsers are excluded from Native APIs.  
This is so it won't interfere with the browser extension as it will always report more accurate information.

## Windows
Supported for apps that report to windows.  
If you see it show up in the media control center or the popup you get when changing volume, it's supported.

## Linux
Not supported yet

## Enabling/Disabling Native APIs
_Note: these instructions are for 2.0.1 and newer. For 2.0.0 refer to [these instructions](https://github.com/keifufu/WebNowPlaying-Redux/blob/b3f56118dac87d83eb66dbb3fa92fe8a8e0b8283/NativeAPIs.md)._
Native APIs are enabled by default as of `2023-06-10`

Open the browser extension settings panel and toggle "Use native APIs".

**OR** (if you don't use the browser extension and only want native players)
- To **disable**: press WIN+R and paste `cmd /c "rmdir "%LocalAppData%/WebNowPlaying/disable_native_apis""`
- To **re-enable**: press WIN+R and paste `cmd /c "mkdir -p "%LocalAppData%/WebNowPlaying/disable_native_apis""`