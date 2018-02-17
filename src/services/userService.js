
class UserService {
  constructor (db) {
    this.db = db;
  }

  async getUserByLoginMethod (loginMethod, userName, emailAddress) {
    if (loginMethod === 'username') {
      return await this.db.getUserByName(userName);
    } else if (loginMethod === 'email') {
      return await this.db.getUserByEmail(emailAddress);
    } else {
      return null;
    }
  }
}

module.exports = UserService;