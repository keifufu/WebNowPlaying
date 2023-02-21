import { defaultSettings, getSettings, setSettings, Settings } from './utils'

let settings: Settings | null = null

const saveOptionsFromForm = () => {
  const swPort = document.querySelector<HTMLInputElement>('#swPort')
  const updateFrequencyMs = document.querySelector<HTMLInputElement>('#updateFrequencyMs')
  const useGeneric = document.querySelector<HTMLInputElement>('#useGeneric')
  const useGenericList = document.querySelector<HTMLInputElement>('#useGenericList')
  const isListBlacklist = document.querySelector<HTMLSelectElement>('#isListBlacklist')
  const genericList = document.querySelector<HTMLTextAreaElement>('#genericList')

  const newSettings: Settings = {
    swPort: parseInt(swPort?.value || defaultSettings.swPort.toString()),
    updateFrequencyMs: parseInt(updateFrequencyMs?.value || defaultSettings.updateFrequencyMs.toString()),
    useGeneric: useGeneric?.checked || defaultSettings.useGeneric,
    useGenericList: useGenericList?.checked || defaultSettings.useGenericList,
    isListBlacklist: isListBlacklist?.value === 'blacklist' || defaultSettings.isListBlacklist,
    genericList: genericList?.value.split('\n').filter((e) => e.trim()) || defaultSettings.genericList
  }

  // Only save if settings have changed
  let changed = false
  if (settings) {
    for (const key in settings) {
      const currValue = settings[key as keyof Settings]
      const newValue = newSettings[key as keyof Settings]

      if (Array.isArray(currValue) && Array.isArray(newValue)) {
        if (currValue.length !== newValue.length) {
          changed = true
          break
        }
      } else if (currValue !== newValue) {
        changed = true
        break
      }
    }

    if (changed) {
      setSettings(newSettings)
      settings = newSettings
    }
  }
}

async function loadOptionsIntoForm() {
  settings = await getSettings()

  const swPort = document.querySelector<HTMLInputElement>('#swPort')
  const updateFrequencyMs = document.querySelector<HTMLInputElement>('#updateFrequencyMs')
  const useGeneric = document.querySelector<HTMLInputElement>('#useGeneric')
  const useGenericList = document.querySelector<HTMLInputElement>('#useGenericList')
  const isListBlacklist = document.querySelector<HTMLInputElement>('#isListBlacklist')
  const genericList = document.querySelector<HTMLTextAreaElement>('#genericList')

  if (swPort) swPort.value = settings.swPort.toString()
  if (updateFrequencyMs) updateFrequencyMs.value = settings.updateFrequencyMs.toString()
  if (useGeneric) useGeneric.checked = settings.useGeneric
  if (useGenericList) useGenericList.checked = settings.useGenericList
  if (isListBlacklist) isListBlacklist.value = settings.isListBlacklist ? 'blacklist' : 'whitelist'
  if (genericList) genericList.value = settings.genericList.join('\n')
}

// Auto save
const saveInterval = setInterval(saveOptionsFromForm, 250)

document.addEventListener('DOMContentLoaded', loadOptionsIntoForm)
window.addEventListener('beforeunload', () => {
  clearInterval(saveInterval)
  saveOptionsFromForm()
})