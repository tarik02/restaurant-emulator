import _ from "lodash";

export default {
  api: {
    baseURL: "http://localhost/api/v1/",
    clientId: "default",
    clientSecret: "secret",
    register: false,
  },

  actors: [
    ..._.times(5, index => ({
      type: 'client',
      login: {
        username: `client-${index + 1}`,
        password: '',
      },
    })),

    ..._.times(5, index => ({
      type: 'driver',
      login: {
        username: `driver-${index + 1}`,
        password: '',
      },
    })),

    ..._.times(5, index => ({
      type: 'cook',
      login: {
        username: `cook-${index + 1}`,
        password: '',
      },
    })),
  ]
};
