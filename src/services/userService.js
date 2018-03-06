
class UserService {
  constructor (db) {
    this.db = db;
  }

  async getUserByLoginMethod (loginMethod, userName, emailAddress) {
    if (loginMethod === 'username') {
      return this.db.getUserByName(userName);
    } else if (loginMethod === 'email') {
      return this.db.getUserByEmail(emailAddress);
    } else {
      return null;
    }
  }

  async extractAffiliateId (affiliateId) {
    if (!affiliateId) {
      return null;
    }
    if (affiliateId.indexOf('u:') === 0) {
      const user = await this.db.getUserByName(affiliateId.replace('u:', ''));
      if (!user) {
        return null;
      }
      return user.username;
    }
    return affiliateId;
  }
}

module.exports = UserService;
