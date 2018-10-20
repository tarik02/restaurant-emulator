type LengthOptions = number

type EmptyLimitOptions = {}
type MinMaxLimitOptions = {
  min: number
  max: number
}
type ExactlyLimitOptions = {
  exactly: number
}
type LimitOptions =
  | EmptyLimitOptions
  | MinMaxLimitOptions
  | ExactlyLimitOptions

type JoinOptions = {
  join?: string
}
type MaxLengthOptions = {
  maxLength?: number
}
type MultipleWordsOptions = {
  wordsPerString?: number
  separator?: string
}
type FormatterOptions = {
  formatter: (string) => string
}

type DefaultOptions =
  | JoinOptions
  | MaxLengthOptions
  | MultipleWordsOptions
  | FormatterOptions

type Options =
  | LengthOptions
  | (LimitOptions | DefaultOptions)


type Random = {
  word(options:
    | MaxLengthOptions
    | MultipleWordsOptions
    | FormatterOptions
  ): string,

  words(options: Options): string[],

  sentence(options: Options): string,

  sentences(options: { count: number } | Options): string,

  location(): { lat: number; lng: number; },
}

const Random: Random
export default Random
