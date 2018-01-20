-- users table
CREATE TABLE users (
  id bigserial PRIMARY KEY,
  username text NOT NULL,
  password text NOT NULL,
  email text NULL,
  email_verified boolean NOT NULL DEFAULT false,
  mfa_key text NULL,
  temp_mfa_key text NULL,
  affiliate_id text NULL,
  app_id int NOT NULL DEFAULT 0,
  date_joined timestamp with time zone NOT NULL DEFAULT NOW(),
  locked_at timestamp with time zone NULL
);

CREATE UNIQUE INDEX unique_username ON users USING btree (lower(username) text_pattern_ops);
CREATE INDEX users_lower_email_idx ON users USING btree(lower(email));

-- sessions table
CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  ip_address inet NOT NULL,
  fingerprint text NOT NULL,
  logged_out_at  timestamp with time zone  NULL,
  expired_at timestamp with time zone  NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
  created_at timestamp with time zone  NOT NULL DEFAULT NOW()
);

-- login_attempts table
CREATE TABLE login_attempts (
  id uuid PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  is_success boolean NOT NULL,
  ip_address inet NOT NULL,
  fingerprint text NOT NULL,
  user_agent text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX login_attempts_user_id_idx ON login_attempts USING btree(user_id);

-- mfa_attempts table
CREATE TABLE mfa_attempts (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  is_success boolean NOT NULL,
  ip_address inet NOT NULL,
  fingerprint text NOT NULL,
  user_agent text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX mfa_attempts_user_id_idx ON mfa_attempts USING btree(user_id);

-- active_sessions view
CREATE VIEW active_sessions AS
  SELECT *
  FROM sessions
  WHERE expired_at >= NOW()
  AND logged_out_at IS NULL;

-- reset_tokens table
CREATE TABLE reset_tokens (
  id   uuid NOT NULL PRIMARY KEY,
  user_id bigint  NOT NULL  REFERENCES users(id),
  used    boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL  DEFAULT NOW(),
  expired_at timestamp with time zone NOT NULL  DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE INDEX reset_tokens_user_id_idx ON reset_tokens(user_id, expired_at);

-- mfa passcodes
CREATE TABLE mfa_passcodes (
  user_id     bigint                    NOT NULL,
  passcode    text                      NOT NULL,
  created_at  timestamp with time zone  NOT NULL  DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_mfa_user_passcodes_day ON mfa_passcodes(user_id, passcode, date_trunc('day', created_at AT TIME ZONE 'Etc/UTC'));

-- ip_whitelist table
CREATE TABLE whitelisted_ips (
  id bigserial PRIMARY KEY,
  ip_address inet NOT NULL,
  user_id bigint NOT NULL REFERENCES users(id),
  unique (ip_address, user_id)
);

CREATE INDEX whitelisted_ips_user_id_idx ON whitelisted_ips USING btree(user_id);

-- error_logs table
CREATE TABLE error_logs (
  id bigserial PRIMARY KEY,
  created_at timestamp with time zone  NOT NULL DEFAULT NOW(),
  msg text NULL,
  stack text NULL,
  db_query text NULL,
  db_code text NULL,
  source text NOT NULL,
  req_id uuid NULL,
  user_id bigint NULL,
  mail_info text NULL,
  to_email text NULL
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bk;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bk;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO bk;
