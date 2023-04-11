import { createSignal } from 'solid-js'
import { SocketInfoMap } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'

const [socketInfo, setSocketInfo] = createSignal<SocketInfoMap>(new Map())
export const useSocketInfo = () => socketInfo

setInterval(update, 250)
update()

async function update() {
  const info = await ServiceWorkerUtils.getSocketInfo()
  try {
    setSocketInfo(new Map(JSON.parse(info)) as SocketInfoMap)
  } catch {
    // ignore
  }
}