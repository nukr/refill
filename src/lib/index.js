import rethinkdbdash from 'rethinkdbdash'
import config from '../config'
import sleep from './sleep'

const r = rethinkdbdash(Object.assign({}, config.rethinkdb, {cursor: true}))
/**
* join_db_table
*
*/
export function join_db_table (db_list) {
  return db_list.reduce((left, right) => {
    right.tables
      .map(table => ({db: right.db_name, table}))
      .forEach(o => left.push(o))
    return left
  }, [])
}

export async function refill (db_list, client) {
  var counter = 0
  for (var i = 0; i < db_list.length; i++) {
    const { db, table } = db_list[i]
    console.log(`working on db ${db} table ${table}`)
    const dataCursor = await r.db(db).table(table)
    let next = true
    let data = []
    while (next) {
      counter += 1
      try {
        let datum = await dataCursor.next()
        data.push(datum)
      } catch (e) {
        next = false
      }
      if (data.length === config.bulk.size || !next) {
        await es_bulk(data, client, db, table)
        await sleep(config.bulk.delay)
        data = []
      }
    }
  }
  console.log(`inserted ${counter} record`)
}

function es_bulk (data, client, db, table) {
  if (data.length === 0) {
    return
  }
  let bulkData = []
  data.forEach((datum) => {
    bulkData.push({ update: { _index: db, _type: table, _id: datum.id } })
    bulkData.push({ doc: datum, upsert: datum })
  })
  return client.bulk({body: bulkData})
}

export function load_db_list (r) {
  return r.dbList()
    .filter((row) => row.ne('rethinkdb'))
    .map((row) => ({db_name: row}))
    .map((row) => {
      const tables = r.db(row('db_name')).tableList()
      return row.merge({tables: tables})
    })
}
