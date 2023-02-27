import { Component } from 'solid-js'
import { useSettings } from '../hooks/useSettings'

const GenericSettingsPage: Component = () => {
  const { settings } = useSettings()

  return (
    <div class='flex w-full flex-col flex-wrap items-center'>
      hoe
    </div>
  )
}

export default GenericSettingsPage