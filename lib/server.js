import express from 'express';
const app = express();

import morgan from 'morgan';
import bodyParser from 'body-parser';

import Database from './models/db';

import topic from './routes/topic';
import message from './routes/message';
import monitor from './routes/monitor';

// set up our "database"
global.db = new Database();

// add logging; ignore it for test
if (process.env.NODE_ENV !== 'test')
  app.use(morgan('combined'));

// allow parsing of post params
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', topic);
app.use('/', message);
app.use('/', monitor);

app.listen(3000, () => console.log('AwesomeQ app listening on port 3000!'));

export default app;  // for testing
