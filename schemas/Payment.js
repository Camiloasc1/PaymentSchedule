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
    tags: {type: [String], index: true},
    /**
     * The first time to pay (or the only one if no recurrence).
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
             * How many times to repeat this payment.
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
            /**
             * Paid status of the recurrences.
             */
            status: {type: [Boolean], required: true},
            /**
             * The next pending payment.
             */
            next: {type: Date, required: true, index: true}
        },
        required: true
    }
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

/**
 * Calculate the pay days.
 */
PaymentSchema.virtual('payments.dates').get(function () {
    var dates = [];
    for (var i = 0; i < this.recurrence.limit; i++) {
        dates[i] = this.getPaymentDate(i);
    }
    return dates;
});

/**
 * Get the next pending payment
 * @returns {date}
 */
PaymentSchema.methods.getNextPayment = function () {
    var index = this.payments.status.indexOf(false);
    if (index === -1)
        return null;
    return this.getPaymentDate(index);
};
/**
 * Get a payment date by index.
 * @param {number} index
 * @returns {date}
 */
PaymentSchema.methods.getPaymentDate = function (index) {
    var paymentDate = new Date(this.date.getTime());
    switch (this.recurrence.period) {
        case 'day':
            paymentDate.setDate(paymentDate.getDate() + index * this.recurrence.delta);
            break;
        case 'week':
            paymentDate.setDate(paymentDate.getDate() + index * this.recurrence.delta * 7);
            break;
        case 'month':
            paymentDate.setMonth(paymentDate.getMonth() + index * this.recurrence.delta);
            break;
        case 'year':
            paymentDate.setFullYear(paymentDate.getFullYear() + index * this.recurrence.delta);
            break;
    }
    return paymentDate;
};

/**
 * Pre-Validate Middleware.
 */
PaymentSchema.pre('validate', function (next) {
    if (!this.payments)
        this.payments = {};
    if (!this.payments.status)
        this.payments.status = [];
    return next();
    //next(Error('Error Message'));
});
/**
 * Pre-Save Middleware.
 */
PaymentSchema.pre('save', function (next) {
    if (this.payments.status.length > this.recurrence.limit)
        this.payments.status = this.payments.status.slice(0, this.recurrence.limit);
    if (this.payments.status.length < this.recurrence.limit)
        for (var i = this.payments.status.length; i < this.recurrence.limit; i++) {
            this.payments.status[i] = false;
        }
    this.payments.next = this.getNextPayment();
    return next();
    //next(Error('Error Message'));
});

module.exports = mongoose.model('Payment', PaymentSchema);
