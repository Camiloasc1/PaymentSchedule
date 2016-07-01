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
    payment.save(function (err, result) {
        if (err) return next(err);
        res.json(result)
    });
});

router.get('/search', function (req, res, next) {
    var query = Payment.find();
    if (req.query.query) {
        var regex = new RegExp(req.query.query, 'i');
        query.or([{name: {$regex: regex}}, {tags: {$regex: regex}}]);
        //query.where('name').regex(regex);
        //query.where('tags').regex(regex);
    }
    query.exec(function (err, result) {
            if (err) return next(err);
            res.json(result);
        }
    );
});

router.get('/next', function (req, res, next) {
    var query = Payment.find();
    query.where('payments.next').ne(null);
    if (req.query.after) {
        query.where('payments.next').gte(new Date(req.query.after));
    }
    if (req.query.before) {
        query.where('payments.next').lte(new Date(req.query.before));
    }
    query.sort({'payments.next': 1});
    query.exec(function (err, result) {
            if (err) return next(err);
            res.json(result);
        }
    );
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
            result.tags = req.body.tags;
            result.date = req.body.date;
            result.recurrence = req.body.recurrence;
            result.payments = req.body.payments;
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
