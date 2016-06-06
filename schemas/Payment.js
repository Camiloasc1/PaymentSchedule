var mongoose = require('mongoose');

var PaymentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true}, // First time to pay (or the only one if recurrence is 0)
    recurrence: {type: Number, min: 0, required: true}, // In days, 0: only once, 1: every day, 7: one week, 14: two weeks and so on...
    paymentsDone: [Date] // Recurrences marked as paid.
});

PaymentSchema.methods.pay = function () {
    this.payments.push(Date.now());
};

module.exports = mongoose.model('Payment', PaymentSchema);
