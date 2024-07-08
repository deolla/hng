// Update with your config settings.
const path = require('path');
const {
  config: dotenvConfig
} = require('dotenv');
dotenvConfig({
  path: path.join(__dirname, '../../.env')
});

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: process.env.PG_CLIENT,
    connection: {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: Number(process.env.PG_PORT),
      ssl: process.env.PG_SSL === 'true'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },
  test: {
    client: process.env.PG_CLIENT,
    connection: {
      host: process.env.PG_HOST,
      user: process.env.USER,
      password: process.env.PG_PASSWORD,
      database: process.env.DBNAME,
      port: Number(process.env.PG_PORT),
      ssl: process.env.PG_SSL === 'true'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL1,
      host: 'aws-0-eu-central-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      password: process.env.PASS,
      ssl: {
        rejectUnauthorized: false
      }
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  }
};