import clsx from 'clsx'
import { Component } from 'solid-js'
import Checkbox from '../components/Checkbox'
import RadioGroup from '../components/Radiogroup'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'

const GenericSettingsPage: Component = () => {
  const { settings, saveSettings } = useSettings()
  const { theme } = useTheme()
  const borderColorClass = useBorderColorClass()

  const onChangeUseGeneric = () => {
    saveSettings(() => ({ ...settings(), useGeneric: !settings().useGeneric }), true)
  }

  const onInput = (e: InputEvent) => {
    saveSettings(() => {
      const newList = (e.target as HTMLTextAreaElement).value.split('\n').filter((s) => s !== '').map((s) => s.trim())
      return { ...settings(), genericList: newList }
    })
  }

  return (
    <div class='mx-1 flex h-full w-full flex-col'>
      <Checkbox text='Try to parse media from unsupported websites' checked={settings().useGeneric} onChange={onChangeUseGeneric} />
      <div class={`-mx-3 my-2 w-[111%] border-t border-solid ${borderColorClass()}`} />
      <RadioGroup
        disabled={!settings().useGeneric}
        value={settings().useGenericList ? 'list' : 'all'}
        onChange={(value) => {
          if (value === 'all') saveSettings(() => ({ ...settings(), useGenericList: false }), true)
          else saveSettings(() => ({ ...settings(), useGenericList: true }), true)
        }}
        options={[
          {
            text: 'Allow on all websites',
            value: 'all'
          },
          {
            label: 'www',
            children: (
              <label
                for='www'
                class={clsx(
                  'flex items-center',
                  [settings().useGeneric && 'cursor-pointer'],
                )}
              >
                <span class='text-[0.9rem]'>Only </span>
                <select
                  disabled={!settings().useGeneric || !settings().useGenericList}
                  value={settings().isListBlocked ? 'block' : 'allow'}
                  onChange={(e) => saveSettings(() => ({ ...settings(), isListBlocked: (e.target as HTMLSelectElement).value === 'block' }))}
                  class={clsx(
                    `form-select mx-1 h-6 w-20 rounded-md border border-solid ${borderColorClass()} without-ring py-0 px-2 text-sm`,
                    '',
                    [(!settings().useGeneric || !settings().useGenericList) && 'opacity-50'],
                    [(settings().useGeneric && settings().useGenericList) && 'cursor-pointer'],
                    [theme() === 'dark' && 'bg-[#2b2a33] text-white'],
                    [theme() === 'light' && 'bg-slate-100 text-gray-800'],
                    [theme() === 'konami' && 'bg-transparent text-white']
                  )}
                >
                  <option
                    value='allow'
                    class={clsx(
                      [theme() === 'dark' && 'bg-[#2b2a33] text-white'],
                      [theme() === 'light' && 'bg-slate-100 text-gray-800'],
                      [theme() === 'konami' && 'bg-slate-100 text-gray-800']
                    )}
                  >allow</option>
                  <option
                    value='block'
                    class={clsx(
                      [theme() === 'dark' && 'bg-[#2b2a33] text-white'],
                      [theme() === 'light' && 'bg-slate-100 text-gray-800'],
                      [theme() === 'konami' && 'bg-slate-100 text-gray-800']
                    )}
                  >block</option>
                </select>
                <span class='text-[0.9rem]'> these websites:</span>
              </label>
            ),
            value: 'list'
          }
        ]}
      />
      <textarea
        value={settings().genericList.join('\n')}
        onInput={onInput}
        disabled={!settings().useGenericList || !settings().useGeneric}
        class={clsx(
          `mt-2 mb-1 h-full w-full resize-none rounded-md border border-solid ${borderColorClass()} bg-transparent p-2`,
          [(!settings().useGenericList || !settings().useGeneric) && 'opacity-50'],
        )}
      />
    </div>
  )
}

export default GenericSettingsPage