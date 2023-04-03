import { createSignal } from 'solid-js'
import { SocketInfoMap } from '../../../utils/settings'
import { ServiceWorkerUtils } from '../../../utils/sw'

const [socketInfo, setSocketInfo] = createSignal<SocketInfoMap>(new Map())
const update = async () => {
  const info = await ServiceWorkerUtils.getSocketInfo()
  try {
    setSocketInfo(new Map(JSON.parse(info)) as SocketInfoMap)
  } catch {
    // ignore
  }
}
setInterval(update, 250)
update()
export const useSocketInfo = () => socketInfo