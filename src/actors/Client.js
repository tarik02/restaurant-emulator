import _ from 'lodash'

import { Actor } from './Actor'
import random from '../random'

export class Client extends Actor {
  async run() {
    const { data: courses } = await this.$get('/courses')
    const coursesById = _(courses)
      .map(course => [course.id, course])
      .fromPairs()
      .value()

    const doOrder = async () => {
      const cart = _(courses)
        .sampleSize(_.random(1, Math.min(4, courses.length)))
        .map(course => [course.id, _.random(1, 4)])
        .fromPairs()
        .value()

      const price = _(cart)
        .map((count, id) => coursesById[id].price * count)
        .sum()

      const { username, phone } = this._account.data
      const request = {
        cart,
        info: {
          name: username,
          phone,
          price,
          notes: random.sentences({
            count: _.random(1, 4),
            min: 4,
            max: 8,
          }),
        },
        target: {
          address: random.sentence({ min: 4, max: 6, join: ', ' }),
          coordinates: random.location(),
        },
      }
      
      const data = await this.$post('/order', request)
      if (data.status !== 'ok') {
        throw new Error(data)
      }

      const id = data['order_id']
      const token = data['token']
      
      return {
        id,
        token,
      }
    }

    const waitAndRate = async ({ id, token }) => {
      while (true) {
        await this.delay(1000)

        const info = await this.$get(`/order/${id}/${token}`)
        
        if (info.status === 'done') {
          if (!info.needsReview) {
            return
          }

          if (_.random(1, 10) === 1) {
            await this.$post(`/order/dont-rate/${id}/${token}`)
          } else {
            await this.$post(`/order/rate/${id}/${token}`, {
              text: random.sentences({
                count: _.random(5, 15),
                min: 6,
                max: 12,
              }),
              rating: _.random(1, 5),
            })
          }
        }
      }
    }
    
    while (true) {
      await this.delay(_.random(10, 30) * 1000)

      try {
        const orderData = await doOrder()
        await waitAndRate(orderData)
      } catch (e) {
        this.reportError(e)
      }
    }
  }
}
