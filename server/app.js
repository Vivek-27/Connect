const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 5000;
const { MONGO_URI } = require('./keys');
const cors = require('cors');

mongoose.connect(MONGO_URI, {
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
});
mongoose.connection.on('error', (err) => {
  console.log('err connecting', err);
});

require('./models/user');
require('./models/post');

app.use(cors());

app.use(express.json());
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

app.listen(PORT, () => {
  console.log('Server is Running on port ' + PORT);
});
