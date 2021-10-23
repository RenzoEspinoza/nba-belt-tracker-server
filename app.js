const express = require('express');
const app = express();
const matchupRouter = require('./controllers/matchup');
const middleware = require('./utils/middleware');

app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/matchup', matchupRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;