import clsx from 'clsx'
import { IoClose } from 'solid-icons/io'
import { Component, createSignal, For } from 'solid-js'
import { SiteSettings, TSupportedSites } from '../../../utils/settings'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'
import Checkbox from './Checkbox'

const [isOpen, setIsOpen] = createSignal(false)
const [site, setSite] = createSignal<TSupportedSites>()

export const openSiteSettings = (site: TSupportedSites) => {
  setSite(site)
  setIsOpen(true)
}

export const Settings: Component = () => {
  const borderColorClass = useBorderColorClass()
  const { theme } = useTheme()
  const siteSettings = () => SiteSettings[site() as TSupportedSites]
  const { settings, saveSettings } = useSettings()
  const getValue = (key: string) => settings()[key as keyof typeof Settings]
  const saveValue = (key: string, value: any) => saveSettings(() => ({ ...settings(), [key]: value } as any), true)

  return (
    <div class={clsx(
      'fixed top-0 left-0 z-50 flex h-full w-full cursor-pointer items-center justify-center bg-black/50 transition-all duration-100',
      [!isOpen() && 'pointer-events-none opacity-0']
    )} onClick={() => setIsOpen(false)}>
      <div class={
        clsx(
          `flex w-[75%] cursor-default flex-col rounded-md border border-solid ${borderColorClass()} p-2`,
          [theme() === 'dark' && 'bg-[#2b2a33] text-white'],
          [theme() === 'light' && 'bg-slate-100 text-gray-800'],
          [theme() === 'konami' && 'bg-gradient-to-tl from-[#0CB6C4] to-[#1D358F] text-white']
        )
      } onClick={(e) => e.stopPropagation()}>
        <div class='flex items-center justify-between'>
          <div>{site()} Settings</div>
          <IoClose class='float-right cursor-pointer hover:opacity-50' size={18} onClick={() => setIsOpen(false)} />
        </div>
        <div class={`-mx-2 my-2 w-[104%] border-t border-solid ${borderColorClass()}`} />
        <div class='flex flex-col'>
          <For each={siteSettings()}>
            {({ name, description, key, type }) => (<>
              {type === 'checkbox' && (
                <Checkbox text={name} checked={getValue(key)} onChange={() => saveValue(key, !getValue(key))} />
              )}
              <div class={clsx(
                'text-sm',
                [theme() !== 'konami' && 'text-gray-500'],
                [theme() === 'konami' && 'text-gray-300']
              )}>
                {description}
              </div>
            </>)}
          </For>
        </div>
      </div>
    </div>
  )
}

export default Settings