
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
}

module.exports = UserService;
