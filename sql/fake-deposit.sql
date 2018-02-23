INSERT INTO user_balances (user_id, currency, balance) (
  SELECT users.id, currencies.id, '1000000000'
  FROM users
  CROSS JOIN currencies
) ON CONFLICT DO NOTHING
