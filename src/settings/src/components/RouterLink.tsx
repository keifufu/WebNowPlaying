import { A, useLocation } from '@solidjs/router'
import clsx from 'clsx'
import { Component } from 'solid-js'
import { useTheme } from '../hooks/useTheme'

const RouterLink: Component<{ text: string, link: string }> = (props) => {
  const location = useLocation()
  const { theme } = useTheme()

  return (
    <A
      class={clsx(
        'cursor-pointer',
        [location.pathname === props.link && theme() === 'dark' && 'text-cyan-500 underline'],
        [location.pathname === props.link && theme() === 'light' && 'text-cyan-700 underline'],
        [location.pathname === props.link && theme() === 'konami' && 'text-cyan-300 underline']
      )}
      href={props.link}
    >
      {props.text}
    </A>
  )
}

export default RouterLink