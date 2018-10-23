import Axios from 'axios'
import delay from 'await-delay'
import { extendAxios, proxyMethods, accountInterceptor } from '../axios'

export class Actor {
  constructor() {
    this._api = null
    this._account = null
    this._config = null
  }

  createApi(config) {
    this._api = Axios.create({
      ...config,
      account: this._account,
    })
    extendAxios(this._api)
    proxyMethods(this, this._api)
    accountInterceptor(this._api)
  }

  setAccount(account) {
    this._account = account
  }

  setConfig(config) {
    this._config = config
  }


  get id() {
    return this._config.id
  }

  get account() {
    return this._account
  }

  get roles() {
    return []
  }

  async delay(time) {
    await delay(time * this._config.timeMultiplier)
  }

  reportError(error) {
    console.error(`Actor ${this.id} reported an error: `, error)
  }

  run() {
  }
}
