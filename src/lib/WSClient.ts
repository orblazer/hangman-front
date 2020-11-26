import { EventEmitter } from 'events'

const decoder = new TextDecoder('utf-8')
const specificStatusCodeMappings: Readonly<Record<number, string>> = Object.freeze({
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
  1004: '(For future)',
  1005: 'No Status Received',
  1006: 'Abnormal Closure',
  1007: 'Invalid frame payload data',
  1008: 'Policy Violation',
  1009: 'Message too big',
  1010: 'Missing Extension',
  1011: 'Internal Error',
  1012: 'Service Restart',
  1013: 'Try Again Later',
  1014: 'Bad Gateway',
  1015: 'TLS Handshake'
})

export type WebsocketReadyState = 'connecting' | 'open' | 'closing' | 'closed'

export interface WSClientOptions {
  pingInterval: number
  /** The number of milliseconds to delay before attempting to reconnect. */
  reconnectInterval: number
  /** The maximum number of milliseconds to delay a reconnection attempt. */
  maxReconnectInterval: number
  /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
  reconnectDecay: number

  /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
  timeoutInterval: number

  /** The maximum number of reconnection attempts to make. Unlimited if null. */
  maxReconnectAttempts: number | null
}

export interface WSClientListeners {
  close(reason: string, code: number, wasClean: boolean): void
  message(channel: string, sender: string, data: unknown): void
}

declare interface WSClient {
  on(event: 'connecting' | 'connect' | 'error', listener: () => void): this
  on(event: 'close', listener: WSClientListeners['close']): this
  on(event: 'message', listener: WSClientListeners['message']): this

  once(event: 'connecting' | 'connect' | 'error', listener: () => void): this
  once(event: 'close', listener: WSClientListeners['close']): this
  once(event: 'message', listener: WSClientListeners['message']): this

  removeListener(event: 'connecting' | 'connect' | 'error', listener: () => void): this
  removeListener(event: 'close', listener: WSClientListeners['close']): this
  removeListener(event: 'message', listener: WSClientListeners['message']): this
}

// eslint-disable-next-line no-redeclare
class WSClient extends EventEmitter {
  private readonly url: string
  private readonly options: WSClientOptions
  private native: WebSocket | null = null
  private connectTimeout: NodeJS.Timeout | null = null
  private pingTask: NodeJS.Timeout | null = null
  private _id: string | null = null

  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0

  constructor(url: string, options: Partial<WSClientOptions> = {}) {
    super()
    this.url = url
    this.options = Object.assign(
      {
        pingInterval: 3000,
        timeoutInterval: 2000,

        reconnectInterval: 1000,
        maxReconnectInterval: 30000,
        reconnectDecay: 1.5,
        maxReconnectAttempts: null
      } as WSClientOptions,
      options
    )

    this.connect()
  }

  /**
   * Get the client id
   *
   * @readonly
   * @type {(string | null)}
   * @memberof WSClient
   */
  get id(): string | null {
    return this._id
  }

  /**
   * Get the ready state
   *
   * @readonly
   * @type {WebsocketReadyState}
   * @memberof WSClient
   */
  get readyState(): WebsocketReadyState {
    if (this.native?.readyState === WebSocket.OPEN) {
      return this.id !== null ? 'open' : 'connecting'
    } else if (this.native?.readyState === WebSocket.CONNECTING) {
      return 'connecting'
    } else if (this.native?.readyState === WebSocket.CLOSING) {
      return 'closing'
    }
    return 'closed'
  }

  connect(): void {
    if (this.readyState === 'connecting' || this.readyState === 'open' || this.reconnectTimeout !== null) {
      return
    }

    this.emit('connecting')

    // Instantiate web socket
    this.native = new WebSocket(this.url)
    this.native.binaryType = 'arraybuffer'

    this.connectTimeout = setTimeout(() => {
      this.native?.close(4000)
    }, this.options.timeoutInterval)

    // Bind events
    this.native.onopen = this.onOpen.bind(this)
    this.native.onclose = this.onClose.bind(this)
    this.native.onerror = this.onError.bind(this)
    this.native.onmessage = this.onMessage.bind(this)
  }

  private reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.options.maxReconnectAttempts && this.reconnectAttempts++ > this.options.maxReconnectAttempts) {
      this.native?.close(1013)
      return
    }

    this.connect()
  }

  /**
   * Close the connection
   * @param code The close code
   * @param reason The close reason
   */
  close(code?: number, reason?: string): void {
    if (this.readyState === 'open') {
      this.native?.close(code, reason)
    }
  }

  /**
   * Send an data
   * @param channel The channel
   * @param data The data want sended
   */
  send(channel: string, data?: unknown): void {
    if (this.readyState === 'open') {
      if (typeof data === 'function') {
        throw new Error('Could not send an function')
      } else if (typeof data !== 'undefined' && data !== null) {
        this.native?.send(Buffer.from(JSON.stringify([channel, this.id, data])))
      } else {
        this.native?.send(Buffer.from(JSON.stringify([channel, this.id])))
      }
    } else {
      if (this.listenerCount('error') > 0) {
        this.emit('error')
      }
    }
  }

  private onOpen() {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout)
      this.connectTimeout = null
    }

    // Start ping task
    this.pingTask = setInterval(() => {
      this.native?.send('')
    }, Math.max(this.options.pingInterval))

    this.reconnectAttempts = 0
  }

  private onClose({ reason, code, wasClean }: CloseEvent) {
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout)
      this.connectTimeout = null
    }
    if (this.pingTask) {
      clearInterval(this.pingTask)
      this.pingTask = null
    }

    this.emit('close', reason === '' ? specificStatusCodeMappings[code] || 'UNKNOWN' : reason, code, wasClean)

    // Automatically reconnect if is anormal reconnect
    if (code > 1000 && code <= 4000 && code !== 1013) {
      this.reconnectTimeout = setTimeout(
        () => this.reconnect(),
        Math.min(
          this.options.reconnectInterval * Math.pow(this.options.reconnectDecay, this.reconnectAttempts),
          this.options.maxReconnectInterval
        )
      )
    }
  }

  private onError() {
    if (this.listenerCount('error') > 0) {
      this.emit('error')
    }
    this.native?.close()
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
}
export default WSClient
