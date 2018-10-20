export const Methods = [
  'request',
  'delete',
  'get',
  'head',
  'options',
  'post',
  'put',
  'patch'
]

export const extendAxios = axios => {
  for (let method of Methods) {
    axios['$' + method] = async (...args) => {
      const res = await axios[method](...args)

      if (res) {
        return res.data
      }

      return res
    }
  }
}

export const proxyMethods = (instance, axios) => {
  for (let method of Methods) {
    instance['$' + method] = axios['$' + method]
  }
}

export const accountInterceptor = axios => {
  axios.interceptors.request.use(config => {
    if (config.account) {
      config.headers['Authorization'] = config.account.authorization
      delete config.account
    }

    return config
  })
}
