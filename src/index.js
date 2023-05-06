const express = require('express');
const route = require('./router');
const dotenv = require('dotenv');
const app = express();
const port = 3001;

dotenv.config();

var morgan = require('morgan');
app.use(morgan('combined')); //http logger

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //format body client
app.get('/', (req, res, next) => {
    res.send('hello world!');
});
route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
