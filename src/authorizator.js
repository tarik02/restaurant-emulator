import _ from 'lodash'
import random from './random'

export class Authorizator {
  constructor(api, clientId, clientSecret, register) {
    this._api = api
    this._clientId = clientId
    this._clientSecret = clientSecret
    this._register = register

    api.interceptors.request.use(config => {
      if (config.account) {
        config.headers['Authorization'] = config.account.authorization
        delete config.account
      }

      return config
    })
  }

  async login(actor, username, password) {
    const response = await this._api.$post('/auth/token', {
      client_id: this._clientId,
      client_secret: this._clientSecret,
      grant_type: 'emulator',

      username,
      password,
      email: random.email(),
      phone: random.phone(),
      roles: JSON.stringify(_.union(['user'], actor.roles)),
    })

    const tokenType = response.token_type
    const accessToken = response.access_token

    const authorization = `${tokenType} ${accessToken}`

    actor.setAccount({
      data: await this._api.$get('/user', {
        headers: {
          'Authorization': authorization,
        },
      }),
      
      authorization,
    })
  }
}
