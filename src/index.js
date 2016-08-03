import { CronJob } from 'cron'
import {
  load_db_list,
  flatten_db_list,
  refill
} from './lib'

const job = new CronJob('00 */1 * * * *', async () => {
  console.time('load_db_list')
  const db_list = await load_db_list()
  console.timeEnd('load_db_list')

  const flattened_db_list = flatten_db_list(db_list)

  console.time('refill')
  await refill(flattened_db_list)
  console.timeEnd('refill')
}, () => {
  console.log('done')
}, true, 'Asia/Taipei')

job.start()
