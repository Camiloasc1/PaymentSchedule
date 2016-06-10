var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Payment = require('../schemas/Payment.js');

router.get('/', function (req, res, next) {
    var query = Payment.find();
    if (req.query.skip)
        query.skip(Number(req.query.skip));
    if (req.query.limit)
        query.limit(Number(req.query.limit));
    query.exec(function (err, result) {
            if (err) return next(err);
            res.json(result);
        }
    );
});

router.post('/', function (req, res, next) {
    var payment = new Payment(req.body);
    payment.initPayments();
    payment.save(function (err, result) {
        if (err) return next(err);
        res.json(result)
    });
});

router.get('/:id', function (req, res, next) {
    Payment.findById(req.params.id, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
});

router.put('/:id', function (req, res, next) {
    Payment.findByIdAndUpdate(req.params.id, req.body, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
});

router.delete('/:id', function (req, res, next) {
    Payment.findByIdAndRemove(req.params.id, req.body, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
});


module.exports = router;
