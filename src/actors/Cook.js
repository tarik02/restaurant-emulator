import _ from 'lodash'

import { Actor } from './Actor'
import random from '../random'
import { interpolate, distance } from '../geo'

export class Cook extends Actor {
  constructor() {
    super()

    this.status = 'idle'
    this.concurrent = _.random(5, 25)
    this.avail = this.concurrent
    this.isCooking = {}
  }

  async run() {
    while (true) {
      console.log(this.avail)
      const response = await this.$get('/cook/dashboard')
      if (this.avail > 0) {
        const course = response.cookQueue[0]
        if (course) {
          const { order_id: orderId, course_id: courseId, remaining } = course
          if ((await this.$post(`/cook/start-cooking/${orderId}/${courseId}?count=${remaining}`)).status === 'ok') {
            this.avail -= remaining
          }
        }
      }
      for (const item of response.cookingQueue) {
        if (!this.isCooking[item.id]) {
          this.isCooking[item.id] = true

          ;(async () => {
            await this.delay(_.random(2, 10) * 1000)
            if (_.random(0, 20) === 4) {
              await this.$post(`/cook/cancel-cooking/${item.id}`)
            } else {
              await this.$post(`/cook/done-cooking/${item.id}`)
            }

            delete this.isCooking[item.id]
            ++this.avail
          })()
        }
      }

      await this.delay(1000)
    }
  }
}
