var mongoose = require('mongoose');

var PaymentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true}, // First time to pay (or the only one if recurrence is 0)
    recurrence: {type: Number, min: 0, required: true}, // In days, 0: only once, 1: every day, 7: one week, 14: two weeks and so on...
    limit: {type: Number, min: 1, required: true}, // Size of paymentsDone, maximum amount of recurrences.
    paymentsDone: [Boolean] // Paid status of the recurrences.
});

PaymentSchema.methods.setPayment = function (index, status) {
    this.paymentsDone[index] = status;
};

module.exports = mongoose.model('Payment', PaymentSchema);
