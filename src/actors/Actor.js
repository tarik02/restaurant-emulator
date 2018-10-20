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

  run() {
  }

  async delay(time) {
    await delay(time)
  }
}
