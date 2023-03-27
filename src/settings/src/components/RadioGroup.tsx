import clsx from 'clsx'
import { Component, For, Show } from 'solid-js'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'

const RadioGroup: Component<{ options: { text?: string, value: string, children?: any, label?: any }[], bigText?: boolean, value: string, onChange: (value: string) => void, disabled?: boolean }> = (props) => {
  const { theme } = useTheme()
  const borderColorClass = useBorderColorClass()

  return (
    <div class='flex flex-col'>
      <For each={props.options}>
        {({ text, value, children, label }) => (
          <div class='flex items-center'>
            <input
              id={text || label}
              type='radio'
              checked={props.value === value}
              onChange={() => props.onChange(value)}
              disabled={props.disabled}
              class={clsx(
                `form-radio mr-2 h-4 w-4 rounded-full ${borderColorClass()} without-ring bg-transparent transition-all duration-100 ease-in-out`,
                [theme() === 'dark' && 'text-cyan-600'],
                [theme() === 'light' && 'text-cyan-700'],
                [theme() === 'konami' && 'text-cyan-500'],
                [props.disabled && 'opacity-50'],
                [!props.disabled && 'cursor-pointer']
              )}
            />
            <Show when={text}>
              <label
                for={text}
                class={clsx(
                  '-mt-0.5',
                  [!props.bigText && 'text-[0.9rem]'],
                  [props.disabled && 'opacity-50'],
                  [!props.disabled && 'cursor-pointer']
                )}
              >
                {text}
              </label>
            </Show>
            <Show when={children}>
              <div class={clsx(
                [props.disabled && 'opacity-50'],
              )}>
                {children}
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}

export default RadioGroup