# Crypto-boilerplate

### Create Database
1. Create Role = bk and database = bk2
    * For Windows, run `psql.exe -U postgres -f sql/db.sql`
    * For Mac / Linux, run `psql -U {default-db-admin-role} -f sql/db.sql`
2. With user and database created, create schema
    * For Windows, run `psql.exe -U bk -d bk2 -f sql/schema.sql`
    * For Mac / Linux, run `psql -U bk -d bk2 -f sql/schema.sql`

### Development
1. `npm run install-all`
    * Installs dependencies in base and app directory
2. `npm start`: (*This should be sufficient to start the app for development*)
    * Starts node server at port 3002 (*Backend Server*)
    * Starts webpack-dev-middleware from `app/build/express-server` file (*Frontend Server*)
3. `npm run lint`
    * runs eslint on base directory and app directory

## Production
1. `npm run app:build`:
    * Builds web app for production in `app/dist` directory (This directory is not committed to the repo and created on running this command)
    * Backend server serves static content from `app/dist/static` directory at path `/` (*See `src/server.js`)
2. `npm run server:prod`:
    * Starts backend server with NODE_ENV = "production"
