const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// const completeLogin = function (context, userId, rememberMe, msg) {
// create session in db (userId, ip, interval)
// set sessionId cookie
// check for redirect path
// context.response.redirect(redirecturl)
// };

// add recaptcha here
// rate limit
// csrf
router.post('/register', async function (req, res, next) {
  req.check('password', 'Invalid Password').exists()
    .isLength({min: 6, max: 50});
  req.check('password2', 'Passwords do not match').exists()
    .equals(req.body.password);
  
  req.check('email', 'Invalid Email').exists()
    .trim()
    .isLength({max: 255})
    .isEmail();

  req.check('username', 'Invalid Username').exists()
    .trim()
    .isLength({min: 2, max: 20})
    .matches(/^[a-z0-9_]+$/i) // name contains invalid characters
    // .not()
    // .matches(/[_]{2,}/i) // name contains consecutive underscores
    .not()
    .matches(/^[_]|[_]$/i); // name starts or ends with underscores
  // .custom((value, { req }) => db.isUserNameAlreadyTaken(req.body.username) === false);
    
  // not blacklisted username (admin etc)

  const errors = req.validationErrors();
  if (errors) {
    return res.status(422).json({errors});
  }

  const emailExists = await db.isEmailAlreadyTaken(req.body.email);
  if (emailExists) {
    return res.status(422).json({error: 'email already exists'});
  }
  const userNameExists = await db.isUserNameAlreadyTaken(req.body.username);
  if (userNameExists) {
    return res.status(422).json({error: 'username already exists'});
  }

  // const appId = 0; // BetKing
  // get affiliate id
  // const affiliateId = null;

  const hash = await bcrypt.hash(req.body.password, 10); 
  
  const user = await db.createUser(req.body.username, hash, req.body.email); // ipAddress, appid, affiliateid);
  if (user) {
    // await completeLogin(this, user.id, false, 'Registration a success');
    res.json(user);
    // if email supplied, send confirm email ?
    // send welcome email?
  } else {
    res.status(422)
      .end();
  }
});

module.exports = router;
