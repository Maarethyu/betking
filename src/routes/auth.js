var express = require('express')
var router = express.Router()

router.get('/register', function (req, res) {
  res.send('register route')
})

module.exports = router