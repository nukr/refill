export default {
  es: {
    host: 'elasticsearch:9200'
  },
  rethinkdb: {
    host: 'rethinkdb',
    port: 28015
  },
  cron: process.env.CRON || '00 */30 * * * *'
}
