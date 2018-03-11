module.exports = (db) => {
  const getAllBankrolls = async () => {
    const result = await db.any('SELECT * FROM bankrolls');
    return result;
  };

  const getBankrollByCurrency = async (currency) => {
    const result = await db.one('SELECT * FROM bankrolls WHERE currency = $1', currency);
    return result;
  };

  const updateMonthlyBetStats = async (userId, date, betAmount, currency, profit, gameType) => {
    // TODO: review for race condition, review if we need db.tx() here
    await db.tx(t => {
      return t.oneOrNone(`
        UPDATE monthly_bet_stats
        SET total_wagered = total_wagered + $1, total_profit = total_profit + $2
        WHERE game_type = $3 AND currency = $4 AND start_of_month = date_trunc('MONTH', $5::date) AND player_id = $6
        RETURNING id`,
        [betAmount, profit, gameType, currency, date, userId]
      ).then(res => {
        if (!res) {
          return t.none(`
            INSERT INTO monthly_bet_stats
            (player_id, start_of_month, total_wagered, currency, total_profit, game_type)
            VALUES ($1, date_trunc('MONTH', $2::date), $3, $4, $5, $6)`,
            [userId, date, betAmount, currency, profit, gameType]
          );
        }
      });
    });
  };

  const disableBetting = async (userId) => {
    await db.none('UPDATE users SET betting_disabled = true WHERE id = $1', userId);
  };

  const getBetStatsByCurrency = async () => {
    const result = await db.any('SELECT currency, SUM(bet_amount) AS sum_bet_amount, SUM(profit) AS sum_profit, COUNT(id) as num_bets FROM bets GROUP BY currency');
    return result;
  };

  const getBetDetails = async (id) => {
    const result = await db.oneOrNone('SELECT b.*, u.username, u.stats_hidden, d.in_use, d.client_seed, d.server_seed FROM bets AS b INNER JOIN users AS u ON b.player_id = u.id INNER JOIN dice_seeds AS d ON d.id::text = b.seed_details->>\'seed_id\'AND d.player_id = u.id WHERE b.id = $1', [id]);
    if (!result) {
      throw new Error('BET_NOT_FOUND');
    }

    return result;
  };

  const getUserStats = async (username) => {
    const results = await db.any('SELECT u.id, u.stats_hidden, u.username, u.date_joined, b.bets, b.total_wagered, b.profits, b.currency FROM users AS u LEFT JOIN (SELECT player_id, currency, COUNT(*) as bets, SUM(bet_amount) as total_wagered , SUM(profit) as profits FROM bets GROUP BY currency, player_id) AS b ON u.id = b.player_id WHERE u.userName = $1', [username]);

    if (!results.length) {
      throw new Error('USER_NOT_FOUND');
    }

    return results;
  };

  const computeWonLast24Hours = async () => {
    const result = await db.any('SELECT SUM(profit) AS won_last_24_hours, currency FROM bets WHERE profit > 0 AND date > NOW() - interval \'24 hours\' GROUP BY currency');
    return result;
  };

  const toggleStatsHidden = async (userId, statsHidden) => {
    await db.none('UPDATE users SET stats_hidden = $1 WHERE id = $2', [statsHidden, userId]);
  };

  return {
    getAllBankrolls,
    getBankrollByCurrency,
    updateMonthlyBetStats,
    disableBetting,
    getBetStatsByCurrency,
    getBetDetails,
    getUserStats,
    computeWonLast24Hours,
    toggleStatsHidden
  };
};
