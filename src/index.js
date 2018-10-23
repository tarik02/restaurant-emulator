import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'

import { Authorizator } from './authorizator';
import { extendAxios } from './axios'
import actorTypes from './actors'

import config from '../config'

axios.defaults.paramsSerializer = params => qs.stringify(params, { arrayFormat: 'brackets' })

const actorDefaultConfig = {
  ...config.common,
}

const axiosConfig = {
  baseURL: config.api.baseURL,
  responseType: 'json',
  headers: {
    Accept: 'application/json',
  },
}
const api = axios.create(axiosConfig)
extendAxios(api)

const authorizator = new Authorizator(
  api,
  config.api.clientId,
  config.api.clientSecret,
  config.api.register,
)

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
      .map(async ({ type, login, config }, index) => {
        const constructor = actorTypes[type]
        const actor = new constructor()

        if (login) {
          const { username, password } = login
          try {
            await authorizator.login(actor, username, password)
          } catch (e) {
            console.error(`Failed to login with ${username} and ${password}:`, e)
            return null
          }
        }

        actor.createApi(axiosConfig)
        
        let id = '#' + (index + 1)
        if (actor.account) {
          id += `(${actor.account.data.username})`
        }
        actor.setConfig({
          ...actorDefaultConfig,
          id,
        })

        return actor
      })
      .await()
      .value()
    ).filter(it => it)

  const endPromise = Promise.all(_.map(actors, async actor => {
    try {
      await actor.run()
    } catch (e) {
      console.error(`Actor ${actor.id} thrown an error: `, e)
    }
  }))

  await endPromise
})()
