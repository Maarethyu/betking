module.exports = (db) => {
  const getAffiliateSummary = async (username, userId) => {
    const result = await db.any(`SELECT total_claimed, amount_due, payments.currency as payment_currency, payments_due.currency as payments_due_currency from
      (
        SELECT SUM(earnings) as total_claimed, currency
        from users
        inner join
        affiliate_payments on affiliate_payments.affiliate_user_id = users.id
        WHERE users.affiliate_id = $1
        GROUP by affiliate_payments.currency
      ) as payments
      full outer join
      (
        SELECT SUM(total_wagered) as amount_due, currency
        from users
        inner join
        monthly_bet_stats on monthly_bet_stats.player_id = users.id
        WHERE users.affiliate_id = $1
        AND monthly_bet_stats.start_of_month > (
          SELECT COALESCE(MAX(payment_till_date)::DATE, NOW() - interval '1 month') FROM affiliate_payments WHERE user_id = $2
        )
        GROUP by monthly_bet_stats.currency
      ) as payments_due
      on payments.currency = payments_due.currency`,
      [username, userId]
    );

    return result;
  };

  const getAffiliateUsers = async (username, limit, offset) => {
    const results = await db.any(`SELECT COALESCE(SUM(earnings), 0) as earnings, currency, username, users.id as user_id
      from users
      left join
      affiliate_payments on affiliate_payments.affiliate_user_id = users.id
      WHERE users.affiliate_id = $1
      GROUP by affiliate_payments.currency, users.username, users.id
      ORDER BY COALESCE(SUM(earnings), 0) DESC
      LIMIT $2 OFFSET $3`,
      [username, limit, offset]
    );

    const {count} = await db.one('SELECT COUNT(*) FROM users WHERE users.affiliate_id = $1', username);

    return {results, count};
  };

  const getAmountDueByAffiliate = async (username, userId, affiliateUserId) => {
    const result = await db.any(`SELECT COALESCE(SUM(total_wagered), 0) as amount_due, currency
      from users
      inner join
      monthly_bet_stats on monthly_bet_stats.player_id = users.id
      WHERE users.affiliate_id = $1 AND monthly_bet_stats.player_id = $2
      AND monthly_bet_stats.start_of_month > (
        SELECT COALESCE(MAX(payment_till_date)::DATE, NOW() - interval '1 month') FROM affiliate_payments WHERE user_id = $3 AND affiliate_user_id = $2
      )
      GROUP by monthly_bet_stats.currency`,
      [username, affiliateUserId, userId]
    );

    return result;
  };

  return {
    getAffiliateSummary,
    getAffiliateUsers,
    getAmountDueByAffiliate
  };
};
