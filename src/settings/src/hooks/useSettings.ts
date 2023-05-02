import { createSignal } from 'solid-js'
import { randomToken } from '../../../utils/misc'
import { BuiltInAdapters, defaultSettings, Settings, TSupportedSites } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'

const [settings, setSettings] = createSignal<Settings>(defaultSettings);
(async () => setSettings(await ServiceWorkerUtils.getSettings()))()
const saveSettings = (settings: Settings) => {
  setSettings(settings)
  ServiceWorkerUtils.saveSettings(settings)
}

export const useSettings = () => ({
  settings,
  _saveSettingsInternal: saveSettings,
  /* setUpdateFrequencyMs: (updateFrequencyMs: number) => {
    saveSettings({
      ...settings(),
      updateFrequencyMs: updateFrequencyMs
    })
  }, */
  setUseNativeAPIs: (useNativeAPIs: boolean) => {
    saveSettings({
      ...settings(),
      useNativeAPIs
    })
  },
  toggleAdapter: (port: number) => {
    const builtInAdapter = BuiltInAdapters.find((a) => a.port === port)
    if (builtInAdapter) {
      saveSettings({
        ...settings(),
        enabledBuiltInAdapters: settings().enabledBuiltInAdapters.includes(builtInAdapter.name) ? settings().enabledBuiltInAdapters.filter((e) => e !== builtInAdapter.name) : [...settings().enabledBuiltInAdapters, builtInAdapter.name]
      })
    }

    const customAdapter = settings().customAdapters.find((a) => a.port === port)
    if (customAdapter) {
      saveSettings({
        ...settings(),
        customAdapters: settings().customAdapters.map((a) => (a.port === port ? { ...a, enabled: !a.enabled } : a))
      })
    }
  },
  addCustomAdapter: () => {
    if (settings().customAdapters.some((e) => e.port === 0)) return
    saveSettings({
      ...settings(),
      customAdapters: [...settings().customAdapters, { id: randomToken(), enabled: true, port: 0 }]
    })
  },
  updateCustomAdapter: (id: string, port: number) => {
    saveSettings({
      ...settings(),
      customAdapters: settings().customAdapters.map((a) => (a.id === id ? { ...a, port } : a))
    })
  },
  removeCustomAdapter: (id: string) => {
    saveSettings({
      ...settings(),
      customAdapters: settings().customAdapters.filter((a) => a.id !== id)
    })
  },
  toggleUseGeneric: () => saveSettings({ ...settings(), useGeneric: !settings().useGeneric }),
  setUseGenericList: (useGenericList: boolean) => saveSettings({ ...settings(), useGenericList }),
  setIsListBlocked: (isListBlocked: boolean) => saveSettings({ ...settings(), isListBlocked }),
  setGenericList: (genericList: string[]) => saveSettings({ ...settings(), genericList }),
  toggleUseTelemetry: () => saveSettings({ ...settings(), useTelemetry: !settings().useTelemetry }),
  toggleSite: (site: TSupportedSites) => saveSettings({ ...settings(), disabledSites: settings().disabledSites.includes(site) ? settings().disabledSites.filter((a) => a !== site) : [...settings().disabledSites, site] })
})