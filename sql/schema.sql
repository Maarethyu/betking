CREATE TABLE users (
  id bigserial PRIMARY KEY,
  username text NOT NULL,
  password text NOT NULL,
  email text NULL,
  email_verified boolean NOT NULL DEFAULT false,
  mfa_key text NULL,
  affiliate_id bigint NULL,
  app_id int NOT NULL DEFAULT 0,
  date_joined timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  -- logged_out_at  timestamp with time zone  NULL,
  expired_at timestamp with time zone  NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
  created_at timestamp with time zone  NOT NULL DEFAULT NOW()
);

CREATE TABLE login_attempts (
  id uuid PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  is_success boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW()
);