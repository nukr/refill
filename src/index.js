import rethinkdbdash from 'rethinkdbdash'
import flatten from 'lodash/flatten'
import elasticsearch from 'elasticsearch'
import config from './config'

const client = new elasticsearch.Client(config.es)
const r = rethinkdbdash(config.rethinkdb)

function flatten_db_list (db_list) {
  const promises = db_list.map((db) =>
    db.tables.map((table_name) => (
      {db: db.db_name, table: table_name}
    ))
  )

  return flatten(promises)
}

async function refill (db_list) {
  for (var i = 0; i < db_list.length; i++) {
    const { db, table } = db_list[i]
    const data = await r.db(db).table(table)
    for (var j = 0; j < data.length; j++) {
      try {
        var es_result = await client.update({
          index: db,
          type: table,
          body: {
            doc: data[j],
            upsert: data[j]
          },
          id: data[j].id,
          parent: data[j].__parent
        })
        console.log(es_result)
      } catch (e) {
        console.error(e.toJSON())
      }
    }
  }
}

function sleep (ms_time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve)
  }, ms_time)
}

;(async () => {
  for (;;) {
    console.time('refill')
    const db_list = await r.dbList()
      .filter((row) => row.ne('rethinkdb'))
      .map((row) => ({db_name: row}))
      .map((row) => {
        const tables = r.db(row('db_name')).tableList()
        return row.merge({tables: tables})
      })

    const flattened_db_list = flatten_db_list(db_list)
    await refill(flattened_db_list)
    console.timeEnd('refill')

    const await_time = config.await_time
    console.log(`await ${await_time}`)
    await sleep(config.await_time)
  }
})().catch((e) => {
  console.error(e)
})
