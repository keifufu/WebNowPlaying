import { createSignal } from 'solid-js'
import { defaultSettings, sendEvent, Settings } from '../../shared/utils'

let saveTimeout: NodeJS.Timeout
const [settings, _setSettings] = createSignal<Settings>(defaultSettings)
_setSettings(await sendEvent('getSettings'))
export const useSettings = () => {
  const _saveSettings = (newSettings: Settings, instant = false) => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      let changed = false
      if (settings()) {
        for (const key in settings()) {
          const currValue = settings()[key as keyof Settings]
          const newValue = newSettings[key as keyof Settings]

          if (Array.isArray(currValue) && Array.isArray(newValue)) {
            if (currValue.length !== newValue.length) {
              changed = true
              break
            }
            // customAdapter specific checking since ports and enabled can change
            if (key === 'customAdapters') {
              // eslint-disable-next-line max-depth
              for (let i = 0; i < currValue.length; i++) {
                // eslint-disable-next-line max-depth
                if ((currValue[i] as any).port !== (newValue[i] as any).port) {
                  changed = true
                  break
                } else if ((currValue[i] as any).enabled !== (newValue[i] as any).enabled) {
                  changed = true
                  break
                }
              }
            }
          } else if (currValue !== newValue) {
            changed = true
            break
          }
        }

        if (changed) {
          sendEvent('saveSettings', newSettings)
          _setSettings(newSettings)
        }
      }
    }, instant ? 0 : 500)
  }

  return { settings, saveSettings: _saveSettings }
}