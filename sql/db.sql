-- create role bk with password bk
do
$body$
declare
  num_users integer;
begin
   SELECT count(*)
     into num_users
   FROM pg_user
   WHERE usename = 'bk';

   IF num_users = 0 THEN
      CREATE ROLE bk LOGIN PASSWORD 'bk';
   END IF;
end
$body$
;
ALTER ROLE bk CREATEDB;

-- create db bk2 with owner bk
CREATE DATABASE bk2 WITH OWNER=bk;
GRANT ALL PRIVILEGES ON DATABASE bk2 TO bk;
