class OnlineUsers {
  constructor () {
    this.authenticated = [];
    this.anonymous = 0;
  }

  addAnonymousUser () {
    this.anonymous++;
  }

  removeAnonymousUser () {
    this.anonymous--;
  }

  addUser (username) {
    let existingCount = this.getUser(username);
    if (!existingCount) {
      existingCount = {username, count: 0};
      this.authenticated.push(existingCount);
    }
    existingCount.count += 1;
  }

  removeUser (username) {
    const existingCount = this.getUser(username);
    if (existingCount) {
      existingCount.count -= 1;
      if (existingCount.count <= 0) {
        const indexToRemove = this.authenticated.findIndex(user => user.username === username);
        this.authenticated.splice(indexToRemove, 1);
      }
    }
  }

  containsUser (username) {
    return this.getUser(username) !== undefined;
  }

  users () {
    return this.authenticated.map(user => user.username);
  }

  getUser (username) {
    return this.authenticated.find(user => user.username === username);
  }
}

module.exports = OnlineUsers;
