const express = require('express');
const path = require('path');
const router = express.Router();

const routes = {
  index: 'index.html',
  login: 'login.html',
  register: 'register.html',
  'forgot-password': 'forgot-password.html',
  settings: 'settings.html',
  sessions: 'sessions.html'
};

router.get('/:page?', function (req, res, next) {
  const page = req.params.page;

  if (!page) {
    res.redirect('/client/index');
  }

  if (routes[page]) {
    const htmlPath = path.join(__dirname, routes[page]);
    res.sendFile(htmlPath);
  } else {
    res.status(400).send('Page not found');
  }
});

module.exports = router;
