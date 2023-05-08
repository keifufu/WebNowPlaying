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
- Open the browser extensions settings panel and toggle "Use native APIs as fallback"  

**OR** (if you don't use the browser extension and only want native players)  
- Create a folder called "wnp_force_enable_native_api" in your user's directory (C:\Users\<username>)  
Simply press WIN+R and paste `cmd /c "mkdir -p "%AppData%/WebNowPlaying/enable_native_api""`