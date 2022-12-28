const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'firstDb',
  password: 'abhishek123@',
  port: 5432,
});


module.exports = pool;