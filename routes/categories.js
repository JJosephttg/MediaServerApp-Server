'use strict';
var express = require('express');
var router = express.Router();

var body;

router.get('/:categoryName', function (req, res) {

    var category = req.params.categoryName


    res.setHeader('Content-Type', 'application/json');
    body = {
        category: category
    }
    res.send(JSON.stringify(body));
});


module.exports = router;
