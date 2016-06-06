var app = angular.module('PaymentSchedule', ['ngMaterial']);

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
}]);