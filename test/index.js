import {
  join_db_table
} from '../src/lib'

import test from 'ava'

function load_db_list () {
  return new Promise((resolve, reject) => {
    resolve([
      {db_name: 'abc', tables: ['aa', 'bb', 'cc']},
      {db_name: 'qq', tables: ['11', '22', '33']}
    ])
  })
}

test('join_db_table', async (t) => {
  const db_list = await load_db_list()
  const joined_db_list = join_db_table(db_list)
  const expected = [
    {db: 'abc', table: 'aa'},
    {db: 'abc', table: 'bb'},
    {db: 'abc', table: 'cc'},
    {db: 'qq', table: '11'},
    {db: 'qq', table: '22'},
    {db: 'qq', table: '33'}
  ]

  t.deepEqual(joined_db_list, expected)
})
