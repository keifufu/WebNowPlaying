import { Navigate, Route, Routes } from '@solidjs/router'
import clsx from 'clsx'
import { Component } from 'solid-js'
import Hyperlink from './components/Hyperlink'
import RouterLink from './components/RouterLink'
import { useTheme } from './hooks/useTheme'
import AdaptersPage from './routes/AdaptersPage'
import ReportIssuesPage from './routes/ReportIssuesPage'
import SupportedSitesPage from './routes/SupportedSitesPage'
import UnsupportedSitesPage from './routes/UnsupportedSitesPage'

function getExtensionVersion() {
  if (typeof window.chrome?.runtime?.getManifest === 'function') return chrome.runtime.getManifest().version
  else return '0.0.0'
}

const App: Component = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div class={
      clsx(
        'flex h-screen select-none flex-col',
        [theme() === 'dark' && 'bg-[#2b2a33] text-white'],
        [theme() === 'light' && 'bg-white text-black'],
      )
    }>
      <div class='mx-2 mt-2 flex h-min shrink-0 justify-between rounded-md border border-solid border-zinc-500 px-4 pt-1 pb-2'>
        <RouterLink text='Adapters' link='/adapters' />
        <RouterLink text='Supported Sites' link='/supportedSites' />
        <RouterLink text='Unsupported sites' link='/unsupportedSites' />
        <RouterLink text='Report Issues' link='/reportIssues' />
      </div>
      <div class='m-2 flex h-full grow rounded-md border border-solid border-zinc-500 p-2'>
        <Routes>
          <Route path='/adapters' component={AdaptersPage} />
          <Route path='/supportedSites' component={SupportedSitesPage} />
          <Route path='/unsupportedSites' component={UnsupportedSitesPage} />
          <Route path='/ReportIssuesPage' component={ReportIssuesPage} />
          <Route path='*'>
            <Navigate href='/adapters' />
          </Route>
        </Routes>
      </div>
      <div class='mx-2 mb-2 flex h-min shrink-0 rounded-md border border-solid border-zinc-500 px-3 py-1 text-sm'>
        <div>Made by <Hyperlink text='keifufu' link='https://github.com/keifufu' />, <Hyperlink text='tjhrulz' link='https://github.com/tjhrulz' /></div>
        <a class='ml-20 cursor-pointer' onClick={toggleTheme}>Toggle theme</a>
        <div class='ml-auto'>
          <Hyperlink text='GitHub' link='https://github.com/keifufu/WebNowPlaying-Redux' /> | v{getExtensionVersion()}
        </div>
      </div>
    </div>
  )
}

export default App