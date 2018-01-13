# bk-server

### Create Database
1. Create Role = bk and database = bk2
  * For Windows, run `psql.exe -U postgres sql/db.sql`
  * For Mac / Linux, run `psql -U {default-db-admin-role} postgres sql/db.sql`
2. With user and database created, create schema
  * For Windows, run `psql.exe -U bk -d bk2 -f sql/schema.sql`
  * For Mac / Linux, run `psql -U bk -d bk2 -f sql/schema.sql`

### Development
1. `npm run install-all`
    * Installs dependencies in base and app directory
2. `npm start`: (*This should be sufficient to start the app for development*)
    * Starts node server at port 3002 (*Backend Server*)
    * Starts webpack-dev server at port 8080 (*Frontend Server*)
    * All requests from frontend `/api` endpoint are proxied to `http://localhost:3002` (*For config, see `dev.proxyTable` in `app/config/index.js`*)
3. `npm run lint`
    * runs eslint on base directory and app directory

## Production
1. `npm run app:build`:
    * Builds web app for production in `app/dist` directory (This directory is not committed to the repo and created on running this command)
    * Backend server serves static content from `app/dist/static` directory at path `/` (*See `src/server.js`)
