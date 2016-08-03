export function join_db_table (db_list) {
  return db_list.reduce((left, right) => {
    right.tables
      .map(table => ({db: right.db_name, table}))
      .forEach(o => left.push(o))
    return left
  }, [])
}

export async function refill (db_list, r, client) {
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
  console.log(`inserted ${counter} record`)
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

