import { Component } from 'solid-js'
import Anchor from './Anchor'

function openTab(url: string) {
  if (window.chrome) chrome.tabs.create({ url })
  else window.open(url)
}

const Hyperlink: Component<{ link: string, text: string, highlight?: boolean }> = (props) => (
  <Anchor
    text={props.text}
    highlight={props.highlight}
    link={props.link}
    onClick={(e) => {
      e.preventDefault()
      openTab(props.link)
    }}
  />
)

export default Hyperlink