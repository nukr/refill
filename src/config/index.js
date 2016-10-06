import multiconfig from '@nukr/multiconfig'

export default multiconfig({
  es: {
    host: 'elasticsearch:9200'
  },
  rethinkdb: {
    host: 'rethinkdb',
    port: 28015
  },
  interval: 30 * 1000,
  bulk: {
    size: 100,
    delay: 0
  }
})
