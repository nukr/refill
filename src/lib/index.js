import rethinkdbdash from 'rethinkdbdash'
import elasticsearch from 'elasticsearch'
import flatten from 'lodash/flatten'
import config from '../config'

const client = new elasticsearch.Client(config.es)
const r = rethinkdbdash(config.rethinkdb)

export function flatten_db_list (db_list) {
  const promises = db_list.map((db) =>
    db.tables.map((table_name) => (
      {db: db.db_name, table: table_name}
    ))
  )

  return flatten(promises)
}

export async function refill (db_list) {
  var counter = 0
  for (var i = 0; i < db_list.length; i++) {
    const { db, table } = db_list[i]
    const data = await r.db(db).table(table)
    for (var j = 0; j < data.length; j++) {
      counter += 1
      try {
        await client.update({
          index: db,
          type: table,
          body: {
            doc: data[j],
            upsert: data[j]
          },
          id: data[j].id,
          parent: data[j].__parent
        })
      } catch (e) {
        console.error(e.toJSON())
      }
    }
  }
  console.log(`inseted ${counter} record`)
}

export function load_db_list () {
  return r.dbList()
    .filter((row) => row.ne('rethinkdb'))
    .map((row) => ({db_name: row}))
    .map((row) => {
      const tables = r.db(row('db_name')).tableList()
      return row.merge({tables: tables})
    })
}

