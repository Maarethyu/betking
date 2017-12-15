const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const createSession = async function (res, userId, rememberMe) {
  const session = await db.createSession(userId, rememberMe ? '365 days' : '2 weeks');
  
  res.cookie('session', session.id, 
    {
      maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000, 
      secure: true, 
      httpOnly: true
    });
};

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
    .not()
    .matches(/^[_]|[_]$/i); // name starts or ends with underscores

  const errors = req.validationErrors();
  if (errors) {
    return res.status(422).json({errors});
  }

  // TODO can this be a custom express-validator?
  const emailExists = await db.isEmailAlreadyTaken(req.body.email);
  if (emailExists) {
    return res.status(422).json({error: 'email already exists'});
  }

  // TODO can this be a custom express-validator?
  const userNameExists = await db.isUserNameAlreadyTaken(req.body.username);
  if (userNameExists) {
    return res.status(422).json({error: 'username already exists'});
  }

  const hash = await bcrypt.hash(req.body.password, 10); 
  
  const user = await db.createUser(req.body.username, hash, req.body.email); 
  if (user) {
    await createSession(res, user.id, false);
    res.json(user);
  } else {
    res.status(422)
      .end();
  }
});

module.exports = router;
