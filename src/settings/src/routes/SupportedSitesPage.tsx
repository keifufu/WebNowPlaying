import { Component, For } from 'solid-js'
import { SupportedSites, TSupportedSites } from '../../../utils/settings'
import Checkbox from '../components/Checkbox'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass } from '../hooks/useTheme'

type SiteProps = {
  name: TSupportedSites
  enabled: boolean
}

const Site: Component<SiteProps> = (props) => {
  const { settings, saveSettings } = useSettings()
  const borderColorClass = useBorderColorClass()

  const onChange = () => {
    saveSettings(() => ({ ...settings(), disabledSites: settings().disabledSites.includes(props.name) ? settings().disabledSites.filter((a) => a !== props.name) : [...settings().disabledSites, props.name] }), true)
  }

  return (
    <div class={`m-[0.19rem] flex w-[32.7%] items-center rounded-md border border-solid ${borderColorClass()} p-[0.21rem] pl-2`}>
      <Checkbox text={props.name} bigText onChange={onChange} checked={props.enabled} />
    </div>
  )
}

const Placeholder = () => {
  const borderColorClass = useBorderColorClass()

  return (
    <div class={`m-[0.19rem] flex w-[32.7%] items-center rounded-md border border-solid ${borderColorClass()} p-[0.21rem] pl-2`}>
      <div class='-mt-0.5 opacity-0'>
        Placeholder
      </div>
    </div>
  )
}

const SiteSettingsPage: Component = () => {
  const { settings } = useSettings()

  return (
    <div class='-m-1 flex w-full flex-col flex-wrap items-center'>
      <For each={SupportedSites}>
        {(site) => (
          <Site name={site} enabled={!settings().disabledSites.includes(site)} />
        )}
      </For>
      {/* fill the extra spaces */}
      <For each={[...Array(30 - SupportedSites.length)].map((_, i) => i)}>
        {() => (
          <Placeholder />
        )}
      </For>
    </div>
  )
}

export default SiteSettingsPage