import { Component, For } from 'solid-js'
import { SupportedSites, TSupportedSites } from '../../../utils'
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
    // 48.8% for two columns
    // 32% for three columns
    <div class={`m-1 flex w-[48.8%] items-center rounded-md border border-solid ${borderColorClass()} p-[0.21rem] pl-2`}>
      <Checkbox text={props.name} bigText onChange={onChange} checked={props.enabled} />
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
    </div>
  )
}

export default SiteSettingsPage