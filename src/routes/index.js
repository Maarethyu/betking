const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const createSession = async function (res, userId, rememberMe) {
  const session = await db.createSession(userId, rememberMe ? '365 days' : '2 weeks');
  
  res.cookie('session', session.id, 
    {
      maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000, 
      secure: false, // TODO -- have cookie.secure as config variable
      httpOnly: true
    });
};

router.post('/login', async function (req, res, next) {
  req.check('password', 'Invalid Password').exists();
  req.check('username', 'Invalid Username').exists();
  req.check('rememberme', 'Invalid remember me option').isBoolean();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({errors});
  }

  // check if user exists, get suer by name
  const user = await db.getUserByName(req.body.username);
  if (!user) {
    return res.status(401).json({error: 'Login failed'});
  } 
  
  const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
  
  await db.logLoginAttempt(user.id, isPasswordCorrect);

  if (user.locked_at) {
    return res.status(401).json({error: 'Account locked'});
  }

  if (!isPasswordCorrect) {
    return res.status(401).json({error: 'Login failed'});
  }
  
  // if require 2fa ask for it, or have it submitted on form?

  await createSession(res, user.id, req.body.rememberme);
  res.json(user); // TODO don't return user
});

router.post('/register', async function (req, res, next) {
  req.check('password', 'Invalid Password').exists()
    .isLength({min: 6, max: 50});

  req.check('password2', 'Passwords do not match').exists()
    .equals(req.body.password);
  
  req.check('email', 'Invalid Email').exists()
    .trim()
    .isLength({max: 255})
    .isEmail()
    .custom(value => db.isEmailAlreadyTaken(value)
      .then(emailExists => {
        if (emailExists) throw new Error();
      })
    )
    .withMessage('email already exists')
    .optional({checkFalsy: true});

  req.check('username', 'Invalid Username').exists()
    .trim()
    .isLength({min: 2, max: 20})
    .matches(/^[a-z0-9_]+$/i) // name contains invalid characters
    .not()
    .matches(/^[_]|[_]$/i) // name starts or ends with underscores
    .custom(value => db.isUserNameAlreadyTaken(req.body.username)
      .then(userNameExists => {
        if (userNameExists) throw new Error();
      })
    )
    .withMessage('username already exists');

  req.check('g-recaptcha-response', 'Invalid captcha').exists()
    .custom(value => require('./validators/captchaValidator')(value));

  const validationResult = await req.getValidationResult();
  if (!validationResult.isEmpty()) {
    return res.status(400).json({errors: validationResult.array()});
  }

  const hash = await bcrypt.hash(req.body.password, 10); 
  
  const user = await db.createUser(req.body.username, hash, req.body.email); 
  if (user) {
    await createSession(res, user.id, false);
    res.json(user); // TODO this shouldn't return user
  } else {
    res.status(500)
      .end();
  }
});

module.exports = router;
