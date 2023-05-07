import { createSignal } from 'solid-js'
import { SocketInfo } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'

const [socketInfo, setSocketInfo] = createSignal<SocketInfo>({ states: new Map() })
export const useSocketInfo = () => socketInfo

setInterval(update, 250)
update()

async function update() {
  const info = await ServiceWorkerUtils.getSocketInfo()
  try {
    const parsedObj = JSON.parse(info, (key, value) => {
      if (key === 'states')
        return new Map(value)
      return value
    })
    setSocketInfo(parsedObj)
  } catch {
    // ignore
  }
}