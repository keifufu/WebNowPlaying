import clsx from 'clsx'
import { Component, createEffect, createSignal, For, Index, onMount, Show } from 'solid-js'
import { isVersionOutdated } from '../../../utils/misc'
import { BuiltInAdapters, defaultSocketInfo, SocketInfo, Adapter as TAdapter } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'
import Anchor from '../components/Anchor'
import Checkbox from '../components/Checkbox'
import Hyperlink from '../components/Hyperlink'
import { useSettings } from '../hooks/useSettings'
import { useSocketInfo } from '../hooks/useSocketInfo'
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
  const { settings, saveSettings } = useSettings()
  const [githubVersion, setGithubVersion] = createSignal('...')
  const borderColorClass = useBorderColorClass()
  const [btnDisabled, setBtnDisabled] = createSignal(false)
  const [lastConnected, setLastConnected] = createSignal(false)
  const [lastConnecting, setLastConnecting] = createSignal(false)
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

  let _timeout: NodeJS.Timeout
  const onChange = () => {
    // Important: measure whether or not to disconnect outside of the timeout
    const disconnect = props.enabled
    saveSettings(() => ({ ...settings(), enabledBuiltInAdapters: settings().enabledBuiltInAdapters.includes(props.adapter.name) ? settings().enabledBuiltInAdapters.filter((a) => a !== props.adapter.name) : [...settings().enabledBuiltInAdapters, props.adapter.name] }), true)
    clearTimeout(_timeout)
    _timeout = setTimeout(() => {
      if (disconnect) ServiceWorkerUtils.disconnectSocket(props.adapter.port)
      else ServiceWorkerUtils.connectSocket(props.adapter.port)
    }, 250)
  }

  return (
    <div class={`mb-2 flex w-full flex-col items-center rounded-md border border-solid ${borderColorClass()} p-2`}>
      <div class='flex w-full items-center'>
        <Checkbox onChange={onChange} checked={props.enabled} />
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
            <Show when={props.info.version !== '0.0.0' && !isVersionOutdated(props.info.version, githubVersion())}>
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

const CustomAdapter: Component<{ enabled: boolean, port: number, info: SocketInfo }> = (props) => {
  const [confirmDelete, setConfirmDelete] = createSignal(false)
  const { settings, saveSettings } = useSettings()
  const borderColorClass = useBorderColorClass()
  const [btnDisabled, setBtnDisabled] = createSignal(false)
  const [lastConnected, setLastConnected] = createSignal(false)
  const [lastConnecting, setLastConnecting] = createSignal(false)
  const { theme } = useTheme()

  const yellow = () => (theme() === 'dark' ? 'text-yellow-400' : theme() === 'light' ? 'text-yellow-600' : 'text-yellow-500')
  const green = () => (theme() === 'dark' ? 'text-green-400' : theme() === 'light' ? 'text-green-600' : 'text-green-500')
  const red = () => (theme() === 'dark' ? 'text-red-400' : theme() === 'light' ? 'text-red-600' : 'text-red-500')

  const toggleConnection = () => {
    if (btnDisabled()) return
    setBtnDisabled(true)
    setLastConnected(props.info.isConnected)
    setLastConnecting(props.info.isConnecting)
    if (props.info.isConnected || props.info.isConnecting) ServiceWorkerUtils.disconnectSocket(props.port)
    else ServiceWorkerUtils.connectSocket(props.port)
  }

  createEffect(() => {
    if (props.info.isConnected !== lastConnected() || props.info.isConnecting !== lastConnecting()) {
      setLastConnected(props.info.isConnected)
      setLastConnecting(props.info.isConnecting)
      setBtnDisabled(false)
    }
  })

  const removePort = () => {
    if (confirmDelete()) {
      saveSettings(() => ({ ...settings(), customAdapters: settings().customAdapters.filter((a) => a.port !== props.port) }), true)
      ServiceWorkerUtils.disconnectSocket(props.port)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  let __timeout: NodeJS.Timeout
  const onInput = (e: InputEvent) => {
    const port = parseInt((e.target as HTMLInputElement).value || '0')
    if (settings().customAdapters.some((a) => a.port === port)) return
    ServiceWorkerUtils.disconnectSocket(props.port)
    saveSettings(() => ({ ...settings(), customAdapters: settings().customAdapters.map((a) => (a.port === props.port ? { ...a, port } : a)) }), true)
    clearTimeout(__timeout)
    if (port !== 0) __timeout = setTimeout(() => ServiceWorkerUtils.connectSocket(port), 250)
  }

  let _timeout: NodeJS.Timeout
  const onChange = () => {
    // Important: measure whether or not to disconnect outside of the timeout
    const disconnect = props.enabled
    saveSettings(() => ({ ...settings(), customAdapters: settings().customAdapters.map((a) => (a.port === props.port ? { ...a, enabled: !props.enabled } : a)) }), true)
    clearTimeout(_timeout)
    _timeout = setTimeout(() => {
      if (disconnect) ServiceWorkerUtils.disconnectSocket(props.port)
      else ServiceWorkerUtils.connectSocket(props.port)
    }, 250)
  }

  return (
    <div class={`mb-2 flex w-full flex-col items-center rounded-md border border-solid ${borderColorClass()} p-2`}>
      <div class='flex w-full items-center'>
        <Checkbox text='Custom Adapter' bigText onChange={onChange} checked={props.enabled} />
        <input
          onInput={onInput}
          placeholder='Port'
          class={clsx(
            `form-input ml-2 h-6 w-14 rounded-md border border-solid ${borderColorClass()} bg-transparent px-2 text-sm focus:ring-offset-0`,
            [theme() === 'konami' && 'placeholder:text-gray-300']
          )}
          value={props.port === 0 ? '' : props.port}
        />
        <div
          class={clsx(
            '-mt-0.5 ml-auto cursor-pointer hover:underline',
            [theme() === 'dark' && 'text-cyan-500'],
            [theme() === 'light' && 'text-cyan-700'],
            [theme() === 'konami' && 'text-cyan-300']
          )}
          onClick={removePort}
        >
          {confirmDelete() ? 'Click again to confirm' : 'Remove'}
        </div>
      </div>
      <div class={clsx(
        'w-full overflow-hidden transition-all duration-200 ease-in-out',
        [props.enabled && props.port && 'h-6'],
        [(!props.enabled || !props.port) && 'h-0'],
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

const AdaptersPage: Component = () => {
  const { settings, saveSettings } = useSettings()
  const borderColorClass = useBorderColorClass()
  const { theme } = useTheme()
  const [reloadDisabled, setReloadDisabled] = createSignal(false)
  const socketInfo = useSocketInfo()

  const onInputUpdateFrequency = (e: InputEvent) => {
    const updateFrequencyMs2 = parseInt((e.target as HTMLInputElement).value)
    if (isNaN(updateFrequencyMs2)) return
    saveSettings(() => ({ ...settings(), updateFrequencyMs2 }))
  }

  return (
    <div class='flex h-full w-full flex-col items-center'>
      <div class='w-full overflow-y-scroll'>
        <For each={BuiltInAdapters}>
          {(adapter) => (
            <Adapter
              adapter={adapter}
              enabled={settings().enabledBuiltInAdapters.includes(adapter.name)}
              info={socketInfo().get(adapter.port) ?? defaultSocketInfo}
            />
          )}
        </For>
        <Index each={settings().customAdapters}>
          {(adapter) => (
            <CustomAdapter
              enabled={adapter().enabled}
              port={adapter().port}
              info={socketInfo().get(adapter().port) ?? defaultSocketInfo}
            />
          )}
        </Index>
        <div class='flex w-full justify-end pr-2'>
          <Anchor
            text='Add custom adapter'
            highlight
            onClick={() => {
              if (settings().customAdapters.find((a) => a.port === 0)) return
              saveSettings(() => ({ ...settings(), customAdapters: [...settings().customAdapters, { enabled: true, port: 0 }] }), true)
            }}
          />
        </div>
        <div class='ml-16 mt-3'>
        Want to create or submit your own adapter? Click <Hyperlink text='here' highlight link='https://github.com/keifufu/WebNowPlaying-Redux/blob/main/CreatingAdapters.md'/>!
        </div>
      </div>
      <div class='mt-auto w-full'>
        <div class={`-mx-3 w-[111%] border-t border-solid ${borderColorClass()}`} />
        <div class='flex'>
          <div class='ml-1 mt-1.5'>Update Frequency in ms:</div>
          <input
            onInput={onInputUpdateFrequency}
            class={clsx(
              `form-input mt-2 ml-2 h-6 w-[3.1rem] rounded-md border border-solid ${borderColorClass()} bg-transparent px-2 text-sm focus:ring-offset-0`,
              [theme() === 'konami' && 'placeholder:text-gray-300']
            )}
            value={settings().updateFrequencyMs2}
            placeholder='ms'
          />
          <div class='ml-auto mt-1.5 mr-1'>
            <Anchor
              text='Apply and Reload'
              highlight
              onClick={() => {
                setReloadDisabled(true)
                ServiceWorkerUtils.reloadSockets()
              }}
              disabled={reloadDisabled()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdaptersPage