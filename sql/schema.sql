CREATE TABLE users (
  id bigserial PRIMARY KEY,
  -- uid uuid NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  email text NULL,
  email_verified boolean NOT NULL DEFAULT false,
  mfa_key text NULL,
  affiliate_id bigint NULL, -- TODO is this right? can't do big serial
  app_id int NOT NULL DEFAULT 0,
  date_joined timestamp with time zone NOT NULL DEFAULT NOW()
);

-- settings