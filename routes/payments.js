var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Payment = require('../schemas/Payment.js');

router.get('/', function (req, res, next) {
    Payment.find(function (err, payments) {
        if (err) return next(err);
        res.json(payments);
    });
});

router.post('/', function (req, res, next) {
    Payment.create(req.body, function (err, pay) {
        if (err) return next(err);
        res.json(pay)
    })
});

module.exports = router;
