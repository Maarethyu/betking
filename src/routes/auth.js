const express = require('express');
const router = express.Router();

router.get('/register', function (req, res) {
  res.send('register route');
});

module.exports = router;
