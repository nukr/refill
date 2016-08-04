import rethinkdbdash from 'rethinkdbdash'
import elasticsearch from 'elasticsearch'
import config from './config'

import {
  load_db_list,
  join_db_table,
  refill
} from './lib'

const client = new elasticsearch.Client(config.es)
const r = rethinkdbdash(config.rethinkdb)

refiller().then(() => {
  setInterval(() => {
    refiller().then(() => {
      console.log('refiller done')
    }).catch((e) => {
      console.error(e)
    })
  }, config.interval)
}).catch((e) => {
  console.error(e)
})

async function refiller () {
  console.time('load_db_list')
  const db_list = await load_db_list(r)
  console.timeEnd('load_db_list')

  const joined_db_table = join_db_table(db_list)

  console.time('refill')
  try {
    await refill(joined_db_table, r, client)
  } catch (e) {
    if (e.status === 400) {
      const json_error = JSON.stringify(e.toJSON(), null, 2)
      console.error(json_error)
    } else {
      console.error(e)
    }
  }
  console.timeEnd('refill')
}
