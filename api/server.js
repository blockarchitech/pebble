/**
 * @description: Pebble Watchapp/Watchface API
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const spotifyRouter = require('./routes/spotify');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    let start = Date.now();
    res.on('finish', () => {
        let duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

app.use('/api/v1/spotify', spotifyRouter);

app.get('/', (req, res) => {
    res.send('ok');
});

app.get('/healthz', (req, res) => {
    res.send('ok');
});

app.all('*', (req, res) => {
    res.status(404).send('not found');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});