import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'

import { Authorizator } from './authorizator';
import { extendAxios } from './axios'
import actorTypes from './actors'

import config from '../config'

axios.defaults.paramsSerializer = params => qs.stringify(params, { arrayFormat: 'brackets' })

const axiosConfig = {
  baseURL: config.api.baseURL,
  responseType: 'json',
  headers: {
    Accept: 'application/json',
  },
}
const api = axios.create(axiosConfig)
extendAxios(api)

const authorizator = new Authorizator(api, config.api.clientId, config.api.clientSecret)

_.mixin({
  await: param => {
    if (param instanceof Array) {
      return Promise.all(param)
    }

    return param
  },
})

;(async () => {
  const actors =
    (await _(config.actors)
      .map(async ({ type, login, config }) => {
        const constructor = actorTypes[type]
        const actor = new constructor()

        if (login) {
          const { username, password } = login
          try {
            const account = await authorizator.login(username, password)

            actor.setAccount(account)
          } catch (e) {
            console.error(e.toString())
            console.error(`Failed to login with ${username} and ${password}`)
            return null
          }
        }

        actor.createApi(axiosConfig)
        actor.setConfig(config)

        return actor
      })
      .await()
      .value()
    ).filter(it => it)

  const endPromise = Promise.all(_.map(actors, async actor => {
    try {
      await actor.run()
    } catch (e) {
      console.error('Actor thrown an error', e)
    }
  }))

  await endPromise
})()
