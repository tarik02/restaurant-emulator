export class Authorizator {
  constructor(api, clientId, clientSecret) {
    this._api = api
    this._clientId = clientId
    this._clientSecret = clientSecret

    api.interceptors.request.use(config => {
      if (config.account) {
        config.headers['Authorization'] = config.account.authorization
        delete config.account
      }

      return config
    })
  }

  async login(username, password) {
    const response = await this._api.$post('/auth/token', {
      client_id: this._clientId,
      client_secret: this._clientSecret,
      grant_type: 'password',
      username,
      password,
    })

    const tokenType = response.token_type
    const accessToken = response.access_token

    const authorization = `${tokenType} ${accessToken}`

    return {
      data: await this._api.$get('/user', {
        headers: {
          'Authorization': authorization,
        },
      }),
      
      authorization,
    }
  }
}
