const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var config = require('config');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.listen(config.get('PORT'));
console.log(`server listenging on port ${config.get('PORT')}`);
