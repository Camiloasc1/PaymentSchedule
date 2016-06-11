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
    description: {type: String, required: true},
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
     * Paid status of the recurrences.
     */
    paymentsDone: {type: [Boolean]}
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

/**
 * Find the next pending payment
 */
PaymentSchema.virtual('nextPayment').get(function () {
    var i = this.paymentsDone.indexOf(false);
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
 * Initialize paymentsDone
 */
PaymentSchema.methods.initPayments = function () {
    if (this.paymentsDone.length > this.recurrence.limit)
        this.paymentsDone = this.paymentsDone.slice(0, this.recurrence.limit);
    if (this.paymentsDone.length < this.recurrence.limit)
        for (var i = this.paymentsDone.length; i < this.recurrence.limit; i++) {
            this.paymentsDone[i] = false;
        }
};

module.exports = mongoose.model('Payment', PaymentSchema);
