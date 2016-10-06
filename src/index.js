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

;(async () => {
  while (true) {
    try {
      await refiller()
      console.log(`waiting ${config.interval}`)
      await sleep(config.interval)
    } catch (e) {
      console.error(e)
    }
    console.log('refiller done')
  }
})()

async function refiller () {
  try {
    var db_list = await load_db_list(r)
    console.log(db_list)
  } catch (e) {
    console.error(e)
  }

  try {
    var joined_db_table = join_db_table(db_list)
    console.log(joined_db_table)
  } catch (e) {
    console.error(e)
  }

  console.time('refill')
  try {
    await refill(joined_db_table, client)
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

function sleep (t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}
