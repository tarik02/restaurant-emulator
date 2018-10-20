import _ from 'lodash'

import { Actor } from './Actor'
import random from '../random'
import { interpolate, distance } from '../geo'

export class Driver extends Actor {
  constructor() {
    super()

    this._location = null
    this._speed = 100 * (1000 / 3600)
    this._lastDriving = null
  }

  async run() {
    while (true) {
      if (this._location) {
        await this.$post('/driver/report-location', {
          location: this._location,
        })
      }

      const response = await this.$get('/driver/dashboard')

      switch (response.status) {
      case 'ready':
        await this.checkOrders(response.orders)
        this.driveRandomly()
        break;
      case 'driving':
        await this.driving(response)
        break;
      default:
        console.warn(`Unknown driver status '${response.status}'`)
      }
      if (this._location === null) {
        const loc = random.location()
        this._location = {
          latitude: loc.lat,
          longitude: loc.lng,
        }
      }
      this._lastDriving = Date.now()

      await this.delay(1000)
    }
  }

  async checkOrders(orders) {
    if (orders.length === 0) {
      return
    }

    const order = _.sample(orders)
    if ((await this.$post(`/driver/do-order/${order.id}`)).status !== 'ok') {
      return
    }
  }

  driveRandomly() {
    if (this._lastDriving !== null) {
      const diff = Date.now() - this._lastDriving
      const speed = this._speed * diff

      const { lat, lng } = interpolate({
        lat: this._location.latitude,
        lng: this._location.longitude,
      }, random.location(), speed)

      this._location.latitude = lat
      this._location.longitude = lng
    }
  }

  async driving(data) {
    if (!this._location) {
      const { latitude, longitude } = data.driver
      if (!latitude || !longitude) {
        return
      }

      this._location = {
        latitude,
        longitude,
      }
    }

    const { order } = data
    const { target: { latitude, longitude } } = order

    if (this._lastDriving !== null) {
      const diff = Date.now() - this._lastDriving
      const speed = this._speed * diff

      const { lat, lng, dist: newDist } = interpolate({
        lat: this._location.latitude,
        lng: this._location.longitude,
      }, {
        lat: latitude,
        lng: longitude,
      }, speed)

      this._location.latitude = lat
      this._location.longitude = lng

      if (newDist < speed) {
        await this.$post('/driver/end-order')
      }
    }
  }
}
