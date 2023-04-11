import clsx from 'clsx'
import { Component, createEffect, createSignal, For, onMount, Show } from 'solid-js'
import { isVersionOutdated } from '../../../utils/misc'
import { SocketInfo, Adapter as TAdapter } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'
import Anchor from '../components/Anchor'
import Checkbox from '../components/Checkbox'
import Hyperlink from '../components/Hyperlink'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'


const AdapterAuthors: Component<{ adapter: TAdapter }> = (props) => {
  const { theme } = useTheme()
  return (
    <For each={props.adapter.authors}>
      {(author, i) => (
        <div class={clsx(
          [theme() === 'dark' && 'text-zinc-400'],
          [theme() === 'light' && 'text-zinc-500'],
          [theme() === 'konami' && 'text-zinc-300'],
        )}>
          <Show when={i() === 0}>
            <span class='-mt-0.5 ml-1 -mr-0.5'>(</span>
          </Show>
          <Hyperlink text={author.name} link={author.link} class='ml-1' />
          <Show when={i() !== props.adapter.authors.length - 1}>
            <span class='-mt-0.5 ml-0.5'>,</span>
          </Show>
          <Show when={i() === props.adapter.authors.length - 1}>
            <span class='-mt-0.5 ml-0.5'>)</span>
          </Show>
        </div>
      )}
    </For>
  )
}

const Adapter: Component<{ adapter: TAdapter, enabled: boolean, info: SocketInfo }> = (props) => {
  const { toggleAdapter } = useSettings()
  const [githubVersion, setGithubVersion] = createSignal('...')
  const borderColorClass = useBorderColorClass()
  const [btnDisabled, setBtnDisabled] = createSignal(false)
  const [lastConnected, setLastConnected] = createSignal(false)
  const [lastConnecting, setLastConnecting] = createSignal(false)
  const [toggleDisabled, setToggleDisabled] = createSignal(false)
  const { theme } = useTheme()

  const yellow = () => (theme() === 'dark' ? 'text-yellow-400' : theme() === 'light' ? 'text-yellow-600' : 'text-yellow-500')
  const green = () => (theme() === 'dark' ? 'text-green-400' : theme() === 'light' ? 'text-green-600' : 'text-green-500')
  const red = () => (theme() === 'dark' ? 'text-red-400' : theme() === 'light' ? 'text-red-600' : 'text-red-500')

  onMount(() => {
    ServiceWorkerUtils.getGithubVersion(props.adapter.gh).then((v) => setGithubVersion(v))
  })

  const toggleConnection = () => {
    if (btnDisabled()) return
    setBtnDisabled(true)
    setLastConnected(props.info.isConnected)
    setLastConnecting(props.info.isConnecting)
    if (props.info.isConnected || props.info.isConnecting) ServiceWorkerUtils.disconnectSocket(props.adapter.port)
    else ServiceWorkerUtils.connectSocket(props.adapter.port)
  }

  createEffect(() => {
    if (props.info.isConnected !== lastConnected() || props.info.isConnecting !== lastConnecting()) {
      setLastConnected(props.info.isConnected)
      setLastConnecting(props.info.isConnecting)
      setBtnDisabled(false)
    }
  })

  return (
    <div class={`mb-2 flex w-full flex-col items-center rounded-md border border-solid ${borderColorClass()} p-2`}>
      <div class='flex w-full items-center'>
        <Checkbox
          checked={props.enabled}
          disabled={toggleDisabled()}
          onChange={() => {
            if (props.enabled) ServiceWorkerUtils.disconnectSocket(props.adapter.port)
            else ServiceWorkerUtils.connectSocket(props.adapter.port)
            toggleAdapter(props.adapter.port)
            setToggleDisabled(true)
            setTimeout(() => setToggleDisabled(false), 250)
          }}
        />
        <Hyperlink text={props.adapter.name} link={`https://github.com/${props.adapter.gh}`} />
        <AdapterAuthors adapter={props.adapter} />
        <Show when={props.enabled && props.info.isConnected}>
          <div class='ml-auto'>
            <Show when={githubVersion() === 'Error'}>
              <div class={`ml-2 ${red()}`}>Couldn't check for updates</div>
            </Show>
            <Show when={githubVersion() !== 'Error' && githubVersion() !== '...' && isVersionOutdated(props.info.version, githubVersion()) && props.info.version !== '0.0.0'}>
              <Hyperlink text='Update available' link={`https://github.com/${props.adapter.gh}/releases/latest`} class={`ml-2 ${yellow()}`} />
            </Show>
            <Show when={props.info.version !== '0.0.0' && githubVersion() !== 'Error' && !isVersionOutdated(props.info.version, githubVersion())}>
              <div class={`ml-2 ${green()}`}>Up to date</div>
            </Show>
          </div>
        </Show>
      </div>
      <div class={clsx(
        'w-full overflow-hidden transition-all duration-200 ease-in-out',
        [props.enabled && 'h-6'],
        [!props.enabled && 'h-0'],
      )}>
        <Show when={props.info._isPlaceholder}>
          <div>Loading..</div>
        </Show>
        <Show when={!props.info._isPlaceholder}>
          <div class='flex'>
            <div class={clsx(
              [props.info.isConnected && green()],
              [!props.info.isConnected && red()],
              [props.info.isConnecting && yellow()]
            )}>
              {props.info.isConnected ? 'Connected' : props.info.isConnecting ? `Connecting.. (Attempt #${props.info.reconnectAttempts + 1})` : 'Not connected'}
            </div>
            <Anchor
              class='ml-auto'
              text={(props.info.isConnected || props.info.isConnecting) ? 'Disconnect' : 'Connect'}
              highlight
              disabled={btnDisabled() || props.info._isPlaceholder}
              onClick={toggleConnection}
            />
          </div>
        </Show>
      </div>
    </div>
  )
}

export default Adapter