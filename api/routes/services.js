/**
 * @description Services Route Handler
 */

const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('ok');
});

router.get('/healthz', (req, res) => {
    res.send('ok');
});

router.get('/config', (req, res) => {
    // check if configs/spotify.html exists
    fs.readFile('configs/services.html', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('config is gone. email hello@blockarchitech.com');
        } else {
            res.send(data);
        }
    });
});

router.put('/analytics', (req, res) => {
    // nothing much is here. JSON body with watchModel, appVersion, platform, watchToken and timestamp

    // check if analytics/spotify.json exists
    fs.readFile('analytics/services.json', 'utf8', (err, data) => {
        if (err) {
            // create the file
            fs.writeFile('analytics/services.json', JSON.stringify({
                created: new Date(),
                updated: new Date(),
                data: [req.body]
            }), (err) => {
                if (err) {
                    res.status(202).send('analytics is dead.');
                }
            });
        } else {
            // DO NOT LOG if the same watchToken is already logged
            let jsonData = JSON.parse(data);
            if (jsonData.data.filter((item) => item.watchToken === req.body.watchToken).length > 0) {
                res.status(200).send('already logged');
                return;
            }

            // update the file
            jsonData.updated = new Date();
            jsonData.data.push(req.body);
            fs.writeFile('analytics/services.json', JSON.stringify(jsonData), (err) => {
                if (err) {
                    res.status(202).send('analytics is dead.');
                }
            });
        }
    });
    res.status(201).send('logged: ' + Object.keys(req.body).join(', '));
});


module.exports = router;