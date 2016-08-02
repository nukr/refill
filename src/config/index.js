export default {
  es: {
    host: 'elasticsearch:9200'
  },
  rethinkdb: {
    host: 'rethinkdb',
    port: 28015
  },
  await_time: process.env.AWAIT_TIME || 30 * 60 * 1000
}
