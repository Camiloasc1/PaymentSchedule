var mongoose = require('mongoose');

/**
 * Schema for a Payment.
 */
var PaymentSchema = new mongoose.Schema({
    /**
     * The name of the payment.
     */
    name: {type: String, required: true, index: true},
    /**
     * The description of the payment.
     */
    description: {type: String},
    /**
     * Tags for this payment.
     */
    tags: {type: [String]},
    /**
     * The first time to pay (or the only one if no recurrence)
     */
    date: {type: Date, required: true},
    /**
     * Which type of recurrence to apply.
     */
    recurrence: {
        type: {
            /**
             * How much periods between recurrences.
             */
            delta: {type: Number, min: 1, required: true},
            /**
             * Repeat every delta days, weeks, months or years.
             */
            period: {type: String, enum: ['day', 'week', 'month', 'year'], lowercase: true, required: true},
            /**
             * How many times to repeat this payment
             */
            limit: {type: Number, min: 1, required: true}
        },
        required: true
    },
    /**
     * Payment recurrences
     */
    payments: {
        type: {
            status: {type: [Boolean]}
        },
        required: true
    }
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

/**
 * The next pending payment
 */
PaymentSchema.virtual('payments.next').get(function () {
    var i = this.payments.status.indexOf(false);
    if (i === -1)
        return null;
    var nextPayment = this.date;
    switch (this.recurrence.period) {
        case 'day':
            nextPayment.setDate(nextPayment.getDate() + i * this.recurrence.delta);
            break;
        case 'week':
            nextPayment.setDate(nextPayment.getDate() + i * this.recurrence.delta * 7);
            break;
        case 'month':
            nextPayment.setMonth(nextPayment.getMonth() + i * this.recurrence.delta);
            break;
        case 'year':
            nextPayment.setFullYear(nextPayment.getFullYear() + i * this.recurrence.delta);
            break;
    }
    return nextPayment;
});

/**
 * Initialize payments
 */
PaymentSchema.methods.initPayment = function () {
    if (!this.tags)
        this.tags = [];
    if (!this.payments)
        this.payments = {};
    if (!this.payments.status)
        this.payments.status = [];
    if (this.payments.status.length > this.recurrence.limit)
        this.payments.status = this.payments.status.slice(0, this.recurrence.limit);
    if (this.payments.status.length < this.recurrence.limit)
        for (var i = this.payments.status.length; i < this.recurrence.limit; i++) {
            this.payments.status[i] = false;
        }
};

module.exports = mongoose.model('Payment', PaymentSchema);
