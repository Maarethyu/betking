INSERT INTO currencies (id, symbol, name, scale, max_withdraw_limit, min_withdraw_limit, withdrawal_fee, no_throttle_amount, min_tip, address_type) VALUES (0, 'BTC', 'Bitcoin', 8, '500000000', '100000', '30000', '1000', '0.001', 'bitcoin');
INSERT INTO currencies (id, symbol, name, scale, max_withdraw_limit, min_withdraw_limit, withdrawal_fee, no_throttle_amount, min_tip, address_type) VALUES (1, 'ETH', 'Ethereum', 8, '10000000000', '100000', '50000', '1000', '0.001', 'ethereum');

INSERT INTO bankrolls (currency, max_win, min_bet_amount, highroller_amount) VALUES (0, '1000000000', '100', '10000000');
INSERT INTO bankrolls (currency, max_win, min_bet_amount, highroller_amount) VALUES (1, '1000000000', '2000', '200000000');
