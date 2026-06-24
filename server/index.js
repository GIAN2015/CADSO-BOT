const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', chatRoutes);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Bot CADSO corriendo en http://localhost:${config.port}`);
  console.log(`Red local: http://192.168.1.41:${config.port}`);
});
