const dice = require('../games/dice');

module.exports = (db) => {
  const getLatestUserDiceBets = async (userId) => {
    const result = await db.any('SELECT id, date, bet_amount, currency, profit, game_details FROM bets WHERE player_id = $1 AND game_type = $2 ORDER BY date desc LIMIT 50', [userId, 'dice']);
    return result;
  };

  const getLatestDiceBets = async (limit) => {
    const result = await db.any('SELECT bets.id AS id, date, bet_amount, currency, profit, game_details, users.username AS username, users.stats_hidden AS stats_hidden FROM bets INNER JOIN users ON users.id = bets.player_id WHERE game_type = \'dice\' ORDER BY date DESC LIMIT $1', limit);
    return result;
  };

  const getLatestDiceHighrollerBets = async (limit) => {
    const result = await db.any('SELECT bets.id AS id, date, bet_amount, bets.currency AS currency, profit, game_details, users.username AS username,  users.stats_hidden AS stats_hidden FROM bets INNER JOIN users ON users.id = bets.player_id INNER JOIN bankrolls ON bankrolls.currency = bets.currency WHERE game_type = \'dice\' AND (bets.bet_amount >= bankrolls.highroller_amount OR bets.profit >= bankrolls.highroller_amount) ORDER BY date desc LIMIT $1', limit);
    return result;
  };

  const getActiveDiceSeed = async (userId) => {
    const result = await db.oneOrNone('SELECT * from dice_seeds WHERE player_id = $1 AND in_use = true', userId);
    return result;
  };

  const addNewDiceSeed = async (userId, newServerSeed, newClientSeed) => {
    const result = await db.one('INSERT INTO dice_seeds (player_id, in_use, client_seed, server_seed, nonce) VALUES ($1, true, $2, $3, 0) RETURNING *', [userId, newClientSeed, newServerSeed]);
    return result;
  };

  const doDiceBet = async (userId, betAmount, currency, profit, roll, target, chance, seedId, nonce) => {
    const result = await db.tx(t => {
      return t.batch([
        t.none('UPDATE dice_seeds SET nonce = nonce + 1 WHERE id = $1', seedId),
        t.one('INSERT INTO bets (player_id, date, bet_amount, currency, profit, game_type, game_details, seed_details) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7) RETURNING *', [userId, betAmount, currency, profit, 'dice', {chance, roll, target}, {seed_id: seedId, nonce}]),
        t.oneOrNone('UPDATE user_balances SET balance = balance + $1 WHERE user_id = $2 AND currency = $3 AND balance >= $4 RETURNING balance', [profit, userId, currency, betAmount])
      ])
        .then(data => {
          const bet = data[1];
          const userBalance = data[2];

          if (!userBalance) {
            throw new Error('INSUFFICIENT_BALANCE');
          }

          return {
            id: bet.id,
            date: bet.date,
            bet_amount: bet.bet_amount,
            currency: bet.currency,
            profit: bet.profit,
            game_details: bet.game_details,
            balance: userBalance.balance,
            nextNonce: bet.seed_details.nonce + 1
          };
        });
    });

    return result;
  };

  const setNewDiceClientSeed = async (userId, newClientSeed) => {
    return db.tx(t => {
      /* Set in_use = false for current active seed */
      return t.one('UPDATE dice_seeds SET in_use = false WHERE player_id = $1 AND in_use = true RETURNING *', userId)
        .then(seed => {
          /* Create new seed with using old server seed and old nonce but new client seed */
          return t.one('INSERT INTO dice_seeds (player_id, in_use, client_seed, server_seed, nonce) VALUES ($1, $2, $3, $4, $5) RETURNING client_seed', [userId, true, newClientSeed, seed.server_seed, seed.nonce]);
        })
        .then(res => ({
          clientSeed: res.client_seed
        }));
    });
  };

  const generateNewSeed = async (userId, newClientSeed) => {
    const result = await db.tx(t => {
      /* Invalidate seeds in use */
      return t.oneOrNone('UPDATE dice_seeds SET in_use = false WHERE player_id = $1 AND in_use = true RETURNING *', userId)
        .then(oldSeed => {
          /* Use old client seed if exists else use new client seed */
          const clientSeed = oldSeed ? oldSeed.client_seed : newClientSeed;
          const serverSeed = dice.generateServerSeed();

          return t.one('INSERT INTO dice_seeds (player_id, in_use, client_seed, server_seed, nonce) VALUES ($1, $2, $3, $4, $5) RETURNING *', [userId, true, clientSeed, serverSeed, 0])
            .then(res => ({
              clientSeed: res.client_seed,
              serverSeedHash: dice.hashServerSeed(res.server_seed),
              nonce: res.nonce,
              previousServerSeed: oldSeed.server_seed,
              previousServerSeedHash: dice.hashServerSeed(oldSeed.server_seed),
              previousClientSeed: oldSeed.client_seed,
              previousNonce: oldSeed.nonce === 0 ? 0 : oldSeed.nonce - 1
            }));
        });
    });

    return result;
  };

  return {
    getLatestUserDiceBets,
    getLatestDiceBets,
    getLatestDiceHighrollerBets,
    getActiveDiceSeed,
    addNewDiceSeed,
    doDiceBet,
    setNewDiceClientSeed,
    generateNewSeed
  };
};
