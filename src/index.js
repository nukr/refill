import { CronJob } from 'cron'
import rethinkdbdash from 'rethinkdbdash'
import elasticsearch from 'elasticsearch'
import config from './config'

import {
  load_db_list,
  flatten_db_list,
  refill
} from './lib'

const client = new elasticsearch.Client(config.es)
const r = rethinkdbdash(config.rethinkdb)

const job = new CronJob('00 */1 * * * *', async () => {
  console.time('load_db_list')
  const db_list = await load_db_list(r)
  console.timeEnd('load_db_list')

  const flattened_db_list = flatten_db_list(db_list)

  console.time('refill')
  await refill(flattened_db_list, r, client)
  console.timeEnd('refill')
}, () => {
  console.log('done')
}, true, 'Asia/Taipei')

job.start()
