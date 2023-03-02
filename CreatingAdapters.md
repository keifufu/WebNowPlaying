# Creating your own adapter
Please read the documentation of [WNPRedux-Adapter-Library](https://github.com/keifufu/WNPRedux-Adapter-Library)  
While this only allows for writing your adapter in C#, **please refrain from re-implementing this library or its communication yourself**.  
I don't want users possibly affected by incompatibilities between WebNowPlaying-Redux and unofficial adapters.

# Submitting your adapter
### Requirements
- Must exclusively use [WNPRedux-Adapter-Library](https://github.com/keifufu/WNPRedux-Adapter-Library) for communication  
- Must be open-sourced on GitHub
- dll's or executables must be published via GitHub releases
- GitHub releases must be tagged as "vx.x.x" or "x.x.x"
- Must use a unique port, which cannot be changed after submitting your adapter.
- GitHub repository should be named "WebNowPlaying-Redux-\<name\>" e.g. "WebNowPlaying-Redux-Rainmeter"

If your adapter meets the requirements, open an issue [here](https://github.com/keifufu/WebNowPlaying-Redux/issues) using the following template:  
```
Issue Title: Request: Add <Adapter Name>
--- 
Name: <Adapter Name>
GitHub: <GitHub Link>
Description: <Short description of what your adapter is used for and a justification for it to be listed in the extension>
```