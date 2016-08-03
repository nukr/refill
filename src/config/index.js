export default {
  es: {
    host: process.env.ES_HOST || 'elasticsearch:9200'
  },
  rethinkdb: {
    host: process.env.RETHINKDB_HOST || 'rethinkdb',
    port: process.env.RETHINKDB_PORT || 28015
  },
  interval: process.env.INTERVAL || 30 * 60 * 1000
}
