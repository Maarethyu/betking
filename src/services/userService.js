class UserService {
  constructor (db) {
    this.db = db;
  }

  async getUserByLoginMethod (loginMethod, userName, emailAddress) {
    if (loginMethod === 'username') {
      return this.db.users.getUserByName(userName);
    } else if (loginMethod === 'email') {
      return this.db.users.getUserByEmail(emailAddress);
    } else {
      return null;
    }
  }

  async extractAffiliateId (affiliateId) {
    if (!affiliateId) {
      return null;
    }
    if (affiliateId.indexOf('u:') === 0) {
      const user = await this.db.users.getUserByName(affiliateId.replace('u:', ''));
      if (!user) {
        return null;
      }
      return user.username;
    }
    return affiliateId;
  }

  async isVip (userId) {
    const isAlreadyVip = await this.db.cubeia.isUserSetAsVip(userId);
    let isVipByStats = false;

    if (!isAlreadyVip) {
      // TODO: Remove hardcoding here
      const btcStats = await this.db.bets.getUserStatsByCurrency(userId, 0);
      const ethStats = await this.db.bets.getUserStatsByCurrency(userId, 1);

      const isVipByBtcStats = !!btcStats && (btcStats.total_wagered >= 0.5 || btcStats.total_profit <= -0.1);
      const isVipByEthStats = !!ethStats && (ethStats.total_wagered >= 5 || ethStats.total_profit <= -1);

      isVipByStats = isVipByBtcStats || isVipByEthStats;

      if (isVipByStats) {
        await this.db.cubeia.toggleVipStatus(userId, true);
      }
    }

    return isAlreadyVip || isVipByStats;
  }
}

module.exports = UserService;
