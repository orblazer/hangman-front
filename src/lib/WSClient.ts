import { EventEmitter } from 'events'
import { setInterval } from 'timers'

const specificStatusCodeMappings: { [code: string]: string } = {
  '1000': 'Normal Closure',
  '1001': 'Going Away',
  '1002': 'Protocol Error',
  '1003': 'Unsupported Data',
  '1004': '(For future)',
  '1005': 'No Status Received',
  '1006': 'Abnormal Closure',
  '1007': 'Invalid frame payload data',
  '1008': 'Policy Violation',
  '1009': 'Message too big',
  '1010': 'Missing Extension',
  '1011': 'Internal Error',
  '1012': 'Service Restart',
  '1013': 'Try Again Later',
  '1014': 'Bad Gateway',
  '1015': 'TLS Handshake'
}
const decoder = new TextDecoder('utf-8')

export interface WSClientOptions {
  pingInterval: number
}

export type WebsocketReadyState = 'closed' | 'closing' | 'connecting' | 'open'
declare interface WSClient {
  on(event: 'connect' | 'error', listener: () => void): this
  on(event: 'close', listener: (reason: string, code: number, wasClean: boolean) => void): this
  on(event: 'message', listener: (channel: string, sender: string, data: unknown) => void): this

  once(event: 'connect' | 'error', listener: () => void): this
  once(event: 'close', listener: (reason: string, code: number, wasClean: boolean) => void): this
  once(event: 'message', listener: (channel: string, sender: string, data: unknown) => void): this
}
// eslint-disable-next-line no-redeclare
class WSClient extends EventEmitter {
  private readonly url: string
  private readonly options: WSClientOptions
  private native: WebSocket | null = null
  private _id: string | null = null
  private pingTask?: NodeJS.Timeout

  constructor(url: string, options: Partial<WSClientOptions> = {}) {
    super()
    this.url = url
    this.options = Object.assign(
      {
        pingInterval: 3000
      } as WSClientOptions,
      options
    )
  }

  get id(): string | null {
    return this._id
  }

  get readyState(): WebsocketReadyState {
    switch (this.native?.readyState || WebSocket.CLOSED) {
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'open'
      default:
        return 'closed'
    }
  }

  /**
   * Check if websocket is connected
   */
  get isConnected(): boolean {
    return this.readyState === 'open'
  }

  /**
   * Connect web socket
   */
  connect(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      // Init ws instance
      this.native = new WebSocket(this.url)
      this.native.binaryType = 'arraybuffer'

      // Bind events
      this.native.onopen = () => {
        if (this.native != null) {
          resolve()

          // Start ping task
          this.pingTask = setInterval(this.ping.bind(this), Math.max(this.options.pingInterval, 1000))

          this.native.onclose = this.onClose.bind(this)
          this.native.onmessage = this.onMessage.bind(this)
        } else {
          reject(new Error('Could not connect to the server'))
        }
      }
      this.native.onerror = () => {
        this.emit('error')
        reject(new Error('Could not connect to the server'))
      }
    })
  }

  /**
   * Close the web socket
   * @param code The code of close
   * @param reason The reason of close
   */
  close(code?: number, reason?: string): void {
    if (this.isConnected) {
      this.native?.close(code, reason)
    }
  }

  /**
   * Send an data to specific channel
   * @param channel The channel want sended
   * @param data The data want sended
   */
  send(channel: string, data?: unknown): void {
    if (this.isConnected && this.id !== null) {
      if (typeof data === 'function') {
        throw new Error('Could not send an function')
      } else if (typeof data !== 'undefined' && data !== null) {
        this.native?.send(Buffer.from(JSON.stringify([channel, this.id, data])))
      } else {
        this.native?.send(Buffer.from(JSON.stringify([channel, this.id])))
      }
    }
  }

  private onClose({ reason, code, wasClean }: CloseEvent) {
    this.pingTask && clearInterval(this.pingTask)
    this.emit('close', reason === '' ? specificStatusCodeMappings[code] || 'UNKNOWN' : reason, code, wasClean)
  }

  private onMessage({ data: rawData }: MessageEvent) {
    const [channel, sender, data] = JSON.parse(decoder.decode(rawData)) as [string, string, unknown]
    if (channel === 'init') {
      this._id = sender
      this.emit('connect')
      return
    }

    this.emit('message', channel, sender, data)
  }

  private ping() {
    if (this.isConnected) {
      this.native?.send('')
    }
  }
}
export default WSClient
