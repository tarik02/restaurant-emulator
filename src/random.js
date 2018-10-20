import _ from 'lodash'
import randomWords from 'random-words'

import { LocationDefault, LocationRadius } from './consts'

const Random = {
  word: () => randomWords(),

  words: randomWords,
  
  sentence: options => {
    const words = randomWords(options)
    if (words instanceof Array) {
      return words.join(' ')
    }
    return words
  },

  sentences: options => _
    .times(options.count, () => Random.sentence(options))
    .map(sentence => _.upperFirst(sentence))
    .map(sentence => sentence + '.')
    .join(' '),
  
  location: () => ({
    lat: _.random(
      LocationDefault.lat - LocationRadius.lat,
      LocationDefault.lat + LocationRadius.lat,
      true
    ),
    lng: _.random(
      LocationDefault.lng - LocationRadius.lng,
      LocationDefault.lng + LocationRadius.lng,
      true
    ),
  }),
}

export default Random
