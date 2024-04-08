const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('ok');
});

router.get('/healthz', (req, res) => {
    res.send('ok');
});

router.get('/raw/spotify', (req, res) => {
    // check if analytics/spotify.json exists
    fs.readFile('analytics/spotify.json', 'utf8', (err, data) => {
        if (err) {
            res.status(400).send('no analytics data');
        }
        // remove watch tokens
        let jsonData = JSON.parse(data);
        jsonData.data.forEach((item) => {
            delete item.watchToken;
        });
        res.send( JSON.stringify(jsonData, null, 2) );
    });
});
router.get('/raw/services', (req, res) => {
    // check if analytics/services.json exists
    fs.readFile('analytics/services.json', 'utf8', (err, data) => {
        if (err) {
            res.status(400).send('no analytics data');
        }
        // remove watch tokens
        let jsonData = JSON.parse(data);
        jsonData.data.forEach((item) => {
            delete item.watchToken;
        });
        res.send( JSON.stringify(jsonData, null, 2) );
    });
});

router.get('/spotify', (req, res) => {
    // Parse some analytics so the user can understand it (e.g. most popular watch model, most popular platform, totals, etc.)
    fs.readFile('analytics/spotify.json', 'utf8', (err, data) => {
        if (err) {
            res.status(400).send('no analytics data');
        }
        let jsonData = JSON.parse(data);
        let watchModels = {};
        let platforms = {};
        let totals = 0;
        jsonData.data.forEach((item) => {
            if (watchModels[item.watchModel]) {
                watchModels[item.watchModel]++;
            } else {
                watchModels[item.watchModel] = 1;
            }
            if (platforms[item.platform]) {
                platforms[item.platform]++;
            } else {
                platforms[item.platform] = 1;
            }
            totals++;
        });
        res.send(`
            <h1>Spotify Analytics</h1>
            <h2>Watch Models</h2>
            <p>
                Most Popular: ${Object.keys(watchModels).reduce((a, b) => watchModels[a] > watchModels[b] ? a : b)}<br>
                Least Popular: ${Object.keys(watchModels).reduce((a, b) => watchModels[a] < watchModels[b] ? a : b)}<br>
            </p>
            <h2>Platforms</h2>
            <p>
                Most Popular: ${Object.keys(platforms).reduce((a, b) => platforms[a] > platforms[b] ? a : b)}<br>
                Least Popular: ${Object.keys(platforms).reduce((a, b) => platforms[a] < platforms[b] ? a : b)}<br>
            </p>
            <h2>Totals</h2>
            <p>
                Number of Watches: ${totals}<br>
            </p>
        `);
    });
});

router.get('/services', (req, res) => {
    // Parse some analytics so the user can understand it (e.g. most popular watch model, most popular platform, totals, etc.)
    fs.readFile('analytics/services.json', 'utf8', (err, data) => {
        if (err) {
            res.status(400).send('no analytics data');
        }
        let jsonData = JSON.parse(data);
        let watchModels = {};
        let platforms = {};
        let totals = 0;
        jsonData.data.forEach((item) => {
            if (watchModels[item.watchModel]) {
                watchModels[item.watchModel]++;
            } else {
                watchModels[item.watchModel] = 1;
            }
            if (platforms[item.platform]) {
                platforms[item.platform]++;
            } else {
                platforms[item.platform] = 1;
            }
            totals++;
        });
        res.send(`
            <h1>Services Analytics</h1>
            <h2>Watch Models</h2>
            <p>
                Most Popular: ${Object.keys(watchModels).reduce((a, b) => watchModels[a] > watchModels[b] ? a : b)}<br>
                Least Popular: ${Object.keys(watchModels).reduce((a, b) => watchModels[a] < watchModels[b] ? a : b)}<br>
            </p>
            <h2>Platforms</h2>
            <p>
                Most Popular: ${Object.keys(platforms).reduce((a, b) => platforms[a] > platforms[b] ? a : b)}<br>
                Least Popular: ${Object.keys(platforms).reduce((a, b) => platforms[a] < platforms[b] ? a : b)}<br>
            </p>
            <h2>Totals</h2>
            <p>
                Number of Watches: ${totals}<br>
            </p>
        `);
    });
});

module.exports = router;