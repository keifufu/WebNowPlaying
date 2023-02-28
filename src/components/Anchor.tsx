import clsx from 'clsx'
import { Component } from 'solid-js'
import { useTheme } from '../hooks/useTheme'

const Anchor: Component<{ text: string, highlight?: boolean, link?: string, onClick: (e: MouseEvent) => void }> = (props) => {
  const { theme } = useTheme()

  return (
    <a
      // eslint-disable-next-line tailwindcss/no-custom-classname
      class={clsx(
        'cursor-pointer',
        [props.highlight && theme() === 'dark' && 'text-cyan-500'],
        [props.highlight && theme() === 'light' && 'text-cyan-700'],
      )}
      href={props.link}
      onClick={props.onClick}
    >
      {props.text}
    </a>
  )
}

export default Anchor