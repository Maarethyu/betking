#!/usr/bin/env bash

heroku pg:psql < sql/drop-tables.sql
heroku pg:psql < sql/schema.sql
heroku pg:psql < sql/populate.sql
