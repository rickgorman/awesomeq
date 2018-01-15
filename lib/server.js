import express from 'express';
const app = express();

import morgan from 'morgan';

import topic from './routes/topic';
import message from './routes/message';
import monitor from './routes/monitor';

app.use(morgan('combined'));

app.use('/', topic);
app.use('/', message);
app.use('/', monitor);

app.listen(3000, () => console.log('AwesomeQ app listening on port 3000!'));