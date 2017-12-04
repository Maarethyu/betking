const config = require('config');
const express = require('express');

const app = express();

/* the front end code is in another repository and developed independantly 
  we serve the built front end code from here
  this allows developers to work on front end code without the security risk of them having access to how
  the backend works.
  It also allows us to have register/login code separate from front end while not worrying about different domains
  TODO - is this a bad way to do this?
*/
app.use(express.static('@/../../client/dist/'));

app.get('/', function (req, res) {
  res.sendFile('index.html'); // from the front end folder
});

const router = express.Router();
router.use('', require('./routes/auth')); 
app.use('/', router); 

app.listen(config.get('PORT'));
console.log(`server listenging on port ${config.get('PORT')}`);
