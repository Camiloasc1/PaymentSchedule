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
    payment.initPayment();
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
    Payment.findById(req.params.id, function (err, result) {
        if (err) return next(err);
        if (!result) {
            err = new Error('Not Found');
            err.status = 404;
            return next(err);
        }
        {
            result.name = req.body.name;
            result.description = req.body.description;
            result.date = req.body.date;
            result.recurrence = req.body.recurrence;
            result.payments = req.body.payments;
            result.initPayment();
        }
        result.save(function (err, result) {
            if (err) return next(err);
            res.json(result)
        });
    });
});

router.delete('/:id', function (req, res, next) {
    Payment.findByIdAndRemove(req.params.id, req.body, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
});


module.exports = router;
