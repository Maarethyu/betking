CREATE TABLE users (
  id bigserial PRIMARY KEY,
  username text NOT NULL,
  password text NOT NULL,
  email text NULL,
  email_verified boolean NOT NULL DEFAULT false,
  mfa_key text NULL,
  temp_mfa_key text NULL,
  affiliate_id text NULL,
  confirm_wd boolean NOT NULL DEFAULT false,
  date_joined timestamp with time zone NOT NULL DEFAULT NOW(),
  locked_at timestamp with time zone NULL
);

CREATE UNIQUE INDEX unique_username ON users USING btree (lower(username) text_pattern_ops);
CREATE INDEX users_lower_email_idx ON users USING btree(lower(email));

CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  ip_address inet NOT NULL,
  fingerprint text NOT NULL,
  logged_out_at  timestamp with time zone  NULL,
  expired_at timestamp with time zone  NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
  created_at timestamp with time zone  NOT NULL DEFAULT NOW()
);

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

CREATE VIEW active_sessions AS
  SELECT *
  FROM sessions
  WHERE expired_at >= NOW()
  AND logged_out_at IS NULL;

CREATE TABLE reset_tokens (
  id   uuid NOT NULL PRIMARY KEY,
  user_id bigint  NOT NULL  REFERENCES users(id),
  used    boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL  DEFAULT NOW(),
  expired_at timestamp with time zone NOT NULL  DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE INDEX reset_tokens_user_id_idx ON reset_tokens(user_id, expired_at);

CREATE TABLE verify_email_tokens (
  id   uuid NOT NULL PRIMARY KEY,
  user_id bigint  NOT NULL  REFERENCES users(id),
  email text NOT NULL,
  used    boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL  DEFAULT NOW(),
  expired_at timestamp with time zone NOT NULL  DEFAULT NOW() + INTERVAL '15 minutes'
);

CREATE INDEX verify_email_tokens_user_id_idx ON verify_email_tokens(user_id, expired_at);

CREATE TABLE mfa_passcodes (
  user_id     bigint                    NOT NULL,
  passcode    text                      NOT NULL,
  created_at  timestamp with time zone  NOT NULL  DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_mfa_user_passcodes_day ON mfa_passcodes(user_id, passcode, date_trunc('day', created_at AT TIME ZONE 'Etc/UTC'));

CREATE TABLE whitelisted_ips (
  id bigserial PRIMARY KEY,
  ip_address inet NOT NULL,
  user_id bigint NOT NULL REFERENCES users(id),
  unique (ip_address, user_id)
);

CREATE INDEX whitelisted_ips_user_id_idx ON whitelisted_ips USING btree(user_id);

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

CREATE TABLE user_balances (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  currency integer NOT NULL,
  balance numeric (36, 0) NOT NULL
);

CREATE UNIQUE INDEX unique_user_id_currency ON user_balances(user_id, currency);
CREATE INDEX user_balances_user_id_idx ON user_balances USING btree(user_id);

CREATE TABLE user_withdrawals (
  id uuid PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  currency integer NOT NULL,
  amount numeric (36, 0) NOT NULL,
  fee numeric (36, 0) NOT NULL,
  status text NOT NULL,
  address text NOT NULL,
  verification_token uuid NULL,
  created_at timestamp with time zone NOT NULL  DEFAULT NOW(),
  verified_at timestamp with time zone NULL
);

CREATE INDEX user_withdrawals_created_at_user_id_idx ON user_withdrawals USING btree (user_id, created_at);

CREATE TABLE user_addresses (
  id bigserial PRIMARY KEY,
  user_id bigint NULL REFERENCES users(id),
  currency integer NOT NULL,
  address text NOT NULL
);

CREATE INDEX user_addresses_user_id_currency_idx ON user_addresses(user_id, currency);

CREATE TABLE user_deposits (
  id uuid PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  currency integer NOT NULL,
  amount numeric (36, 0) NOT NULL,
  address text NOT NULL,
  txid text NOT NULL,
  created_at timestamp with time zone NOT NULL  DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_user_id_txid ON user_deposits(user_id, txid);
CREATE INDEX user_deposits_created_at_user_id_idx ON user_withdrawals USING btree (user_id, created_at);

CREATE TABLE whitelisted_addresses (
  id bigserial PRIMARY KEY,
  user_id bigint NULL REFERENCES users(id),
  currency integer NOT NULL,
  address text NOT NULL
);

CREATE UNIQUE INDEX unique_user_id_currency_idx ON whitelisted_addresses(user_id, currency);
CREATE INDEX whitelisted_addresses_user_id_idx ON whitelisted_addresses USING btree(user_id);

CREATE TABLE bankrolls (
  id bigserial PRIMARY KEY,
  currency integer NOT NULL,
  max_win numeric (36, 0) NOT NULL,
  min_bet_amount numeric (36, 0) NOT NULL
);

CREATE TABLE games (
  id bigserial PRIMARY KEY,
  player_id bigint NOT NULL REFERENCES users(id),
  date timestamp with time zone NOT NULL  DEFAULT NOW(),
  bet_amount numeric (36, 0) NOT NULL,
  currency integer NOT NULL,
  profit numeric (36, 0) NOT NULL,
  game_type text NOT NULL,
  game_details jsonb NOT NULL,
  seed_details jsonb NOT NULL
);

CREATE TABLE dice_seeds (
  id bigserial PRIMARY KEY,
  player_id bigint NOT NULL REFERENCES users(id),
  in_use boolean NOT NULL,
  client_seed text NOT NULL,
  server_seed text NOT NULL,
  nonce integer NOT NULL default 0
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bk;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bk;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO bk;
