import clsx from 'clsx'
import { Component, createEffect, createSignal, Show } from 'solid-js'
import { BuiltInAdapters, SocketInfoState, CustomAdapter as TCustomAdapter } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'
import Anchor from '../components/Anchor'
import Checkbox from '../components/Checkbox'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'
import StrictInput from './StrictInput'

const CustomAdapter: Component<{ adapter: TCustomAdapter, info: SocketInfoState }> = (props) => {
  const [confirmDelete, setConfirmDelete] = createSignal(false)
  const { settings, toggleAdapter, removeCustomAdapter, updateCustomAdapter } = useSettings()
  const borderColorClass = useBorderColorClass()
  const [btnDisabled, setBtnDisabled] = createSignal(false)
  const [lastConnected, setLastConnected] = createSignal(false)
  const [lastConnecting, setLastConnecting] = createSignal(false)
  const [toggleDisabled, setToggleDisabled] = createSignal(false)
  const { theme } = useTheme()

  const yellow = () => (theme() === 'dark' ? 'text-yellow-400' : theme() === 'light' ? 'text-yellow-600' : 'text-yellow-500')
  const green = () => (theme() === 'dark' ? 'text-green-400' : theme() === 'light' ? 'text-green-600' : 'text-green-500')
  const red = () => (theme() === 'dark' ? 'text-red-400' : theme() === 'light' ? 'text-red-600' : 'text-red-500')

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

  const remove = () => {
    if (confirmDelete()) {
      removeCustomAdapter(props.adapter.id)
      ServiceWorkerUtils.disconnectSocket(props.adapter.port)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  let _timeout: NodeJS.Timeout
  return (
    <div class={`mb-2 flex w-full flex-col items-center rounded-md border border-solid ${borderColorClass()} p-2`}>
      <div class='flex w-full items-center'>
        <Checkbox
          label={props.adapter.id}
          text='Custom Adapter'
          checked={props.adapter.enabled}
          disabled={toggleDisabled()}
          bigText
          onChange={() => {
            if (props.adapter.enabled) ServiceWorkerUtils.disconnectSocket(props.adapter.port)
            else ServiceWorkerUtils.connectSocket(props.adapter.port)
            toggleAdapter(props.adapter.port)
            setToggleDisabled(true)
            setTimeout(() => setToggleDisabled(false), 250)
          }}
        />
        <StrictInput
          placeholder='Port'
          class={clsx(
            `form-input ml-2 h-6 w-14 rounded-md border border-solid ${borderColorClass()} bg-transparent px-2 text-sm focus:ring-offset-0`,
            [theme() === 'konami' && 'placeholder:text-gray-300']
          )}
          value={props.adapter.port === 0 ? '' : props.adapter.port.toString()}
          onInput={(value) => {
            const port = parseInt(value || '0')
            if (port === props.adapter.port || isNaN(port)) return
            // Checks if the port is valid
            try {
              // eslint-disable-next-line no-new
              new URL(`ws://localhost:${port}`)
            } catch {
              return
            }
            if (BuiltInAdapters.some((e) => e.port === port)) return
            if (settings().customAdapters.some((e) => e.port === port && e.id !== props.adapter.id)) return
            ServiceWorkerUtils.disconnectSocket(props.adapter.port)
            updateCustomAdapter(props.adapter.id, port)
            clearTimeout(_timeout)
            if (port !== 0) _timeout = setTimeout(() => ServiceWorkerUtils.connectSocket(port), 250)
          }}
        />
        <div
          class={clsx(
            '-mt-0.5 ml-auto cursor-pointer hover:underline',
            [theme() === 'dark' && 'text-cyan-500'],
            [theme() === 'light' && 'text-cyan-700'],
            [theme() === 'konami' && 'text-cyan-300']
          )}
          onClick={remove}
        >
          {confirmDelete() ? 'Click again to confirm' : 'Remove'}
        </div>
      </div>
      <div class={clsx(
        'w-full overflow-hidden transition-all duration-200 ease-in-out',
        [props.adapter.enabled && props.adapter.port && 'h-6'],
        [(!props.adapter.enabled || !props.adapter.port) && 'h-0'],
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

export default CustomAdapter