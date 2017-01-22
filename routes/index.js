'use strict';
var express = require('express');
var router = express.Router();
var body;

/* GET home page. */
router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    body = {
        Hello: 'World'
    }
    res.send(JSON.stringify(body));
});

module.exports = router;
