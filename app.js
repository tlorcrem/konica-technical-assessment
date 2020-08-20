const express = require('express');
const expressApp = express();

expressApp.listen(8080, () => console.log('The game is listening on port 8080!'));

expressApp.use(express.static('client'));

