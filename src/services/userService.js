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
}

module.exports = UserService;
