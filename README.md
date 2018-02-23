# BetKing

### Create Database
1. Create Role = bk and database = bk2
    * For Windows, run `psql.exe -U postgres -f sql/db.sql`
    * For Mac / Linux, run `psql -U {default-db-admin-role} -f sql/db.sql`
2. With user and database created, create schema
    * For Windows, run `psql.exe -U bk -d bk2 -f sql/schema.sql`
    * For Mac / Linux, run `psql -U bk -d bk2 -f sql/schema.sql`
3. Grant Permission to user bk (for dev mode)
    * For Windows, run `psql.exe -U bk -d bk2 -f sql/grant.sql`
    * For Mac / Linux, run `psql -U bk -d bk2 -f sql/grant.sql`
4. Drop all tables in database
    * For Windows, run `psql.exe -U bk -d bk2 -f sql/drop-tables.sql`
    * For Mac / Linux, run `psql -U bk -d bk2 -f sql/drop-tables.sql`
5. Populate currencies and bankrolls tables
    * For Windows, run `psql.exe -U bk -d bk2 -f sql/populate.sql`
    * For Mac / Linux, run `psql -U bk -d bk2 -f sql/populate.sql`
6. Fake Deposit (For all registered, users and all currencies in db, credit balance)
    * For Windows, run `psql.exe -U bk -d bk2 -f sql/fake-deposit.sql`
    * For Mac / Linux, run `psql -U bk -d bk2 -f sql/fake-deposit.sql`

### Development
1. `npm run install-all`
    * Installs dependencies in base and app directory
2. `npm start`: (*This should be sufficient to start the app for development*)
    * Starts node server at port 3002 (*Backend Server*)
    * Starts webpack-dev-middleware from `app/build/express-server` file (*Frontend Server*)
3. `npm run lint`
    * runs eslint on base directory and app directory

### Production
1. `npm run app:build`:
    * Builds web app for production in `app/dist` directory (This directory is not committed to the repo and created on running this command)
    * Backend server serves static content from `app/dist/static` directory at path `/` (*See `src/server.js`)
2. `npm run server:prod`:
    * Starts backend server with NODE_ENV = "production"

### Deploy on Heroku
1. (First time setup) Create a heroku app and provision `heroku-postgres` resource. An environment variable `DATABASE_URL` will be created on heroku.
2. (First time setup) Create a new config variable `FRONTEND_HOST` which should have url of the heroku app deployed (to be used by links in emails)
3. (First time setup) Add heroku url in recaptcha allowed domains
4. Setup Database / Refresh database:
    * For Mac / Linux, run `npm run heroku:setup-databases` which executes heroku commands inside `scripts/heroku-setup-databases.sh` file.
    * For Windows, TODO: setup a similar file
    * NOTE: This runs the local version of sql file
5. Push app to heroku, it should build and deploy
6. Fake Deposit: `heroku pg:psql < sql/fake-deposit.sql` (For all registered, users and all currencies in db, credit balance)
