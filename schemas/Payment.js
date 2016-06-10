var mongoose = require('mongoose');

var PaymentSchema = new mongoose.Schema({
    name: {type: String, required: true, index: true},
    description: {type: String, required: true},
    date: {type: Date, required: true, set: clearTime}, // First time to pay (or the only one if no recurrence)
    recurrence: {
        type: {
            delta: {type: Number, min: 1, required: true},
            period: {type: String, enum: ['day', 'week', 'month', 'year'], lowercase: true, required: true}
        },
        required: true
    },// Recurrence type with a period (1 day, 2 weeks, etc...)
    limit: {type: Number, min: 1, required: true}, // Size of paymentsDone, maximum amount of recurrences.
    paymentsDone: {type: [Boolean]} // Paid status of the recurrences.
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

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

PaymentSchema.methods.initPayments = function () {
    for (var i = 0; i < this.limit; i++) {
        this.paymentsDone[i] = false;
    }
};

function clearTime(date) {
    date = new Date(date);
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
}

module.exports = mongoose.model('Payment', PaymentSchema);
