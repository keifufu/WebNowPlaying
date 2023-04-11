import clsx from 'clsx'
import { Component, createSignal, For, Index } from 'solid-js'
import { BuiltInAdapters, defaultSocketInfo } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'
import Adapter from '../components/Adapter'
import Anchor from '../components/Anchor'
import CustomAdapter from '../components/CustomAdapter'
import Hyperlink from '../components/Hyperlink'
import { useSettings } from '../hooks/useSettings'
import { useSocketInfo } from '../hooks/useSocketInfo'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'

const AdaptersPage: Component = () => {
  const { settings, addCustomAdapter, setUpdateFrequencyMs } = useSettings()
  const borderColorClass = useBorderColorClass()
  const { theme } = useTheme()
  const [reloadDisabled, setReloadDisabled] = createSignal(false)
  const socketInfo = useSocketInfo()

  const onInputUpdateFrequency = (e: InputEvent) => {
    const number = parseInt((e.currentTarget as HTMLInputElement).value)
    if (isNaN(number)) return
    setUpdateFrequencyMs(number)
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
              adapter={adapter()}
              info={socketInfo().get(adapter().port) ?? defaultSocketInfo}
            />
          )}
        </Index>
        <div class='flex w-full justify-end pr-2'>
          <Anchor
            text='Add custom adapter'
            highlight
            onClick={addCustomAdapter}
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
            value={settings().updateFrequencyMs}
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