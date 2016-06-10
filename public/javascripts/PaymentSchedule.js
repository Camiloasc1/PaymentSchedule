"use strict";
var app = angular.module('PaymentSchedule', ['ngRoute', 'ngMaterial']);

app.controller('NavigationController', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
    /**
     * Show or hide the sidenav
     */
    $scope.toggleSideNav = function () {
        $mdSidenav('sidenav').toggle();
    };
    /**
     * Trigger an 'infiniteScroll' event
     */
    $scope.infiniteScroll = function () {
        $scope.$broadcast('infiniteScroll');
    };
}]);

app.controller('HomeController', ['$scope', function ($scope) {
}]);

app.controller('CalendarController', ['$scope', function ($scope) {
}]);

app.controller('PaymentsController', ['$scope', '$http', function ($scope, $http) {
    /**
     * How many payments to load at time.
     * @type {number}
     */
    $scope.chunk = 5;
    /**
     * The payments.
     * @type {Array}
     */
    $scope.payments = [];
    /**
     * Is the content loading?
     * @type {boolean}
     */
    $scope.loading = false;

    /**
     * Load more payments.
     */
    $scope.loadMore = function () {
        $scope.loading = true;
        $http.get('/payments', {
            params: {skip: $scope.payments.length, limit: $scope.chunk}
        })
            .then(function (response) {
                $scope.payments = $scope.payments.concat(response.data);
                $scope.loading = false;
            });
    };
    /**
     * Reload all payments shown.
     * @param {number} [limit=$scope.payments.length] How may payments to reload
     */
    $scope.reload = function (limit) {
        $scope.loading = true;
        $http.get('/payments', {
            params: {skip: 0, limit: limit ? limit : $scope.payments.length}
        })
            .then(function (response) {
                $scope.payments = response.data;
                $scope.loading = false;
            });
    };
    /**
     * Set to paid the next pending payment.
     * @param {object} payment
     */
    $scope.pay = function (payment) {
        // Is there next payments?
        if (!payment.nextPayment)
            return;
        // Find the next pending payment
        var i = payment.paymentsDone.indexOf(false);
        if (i === -1)
            return;
        payment.paymentsDone[i] = true; // Set to paid the next pending payment
        // Push update
        $http.put('/payments/' + payment.id, payment)
            .then(function (response) {
                $scope.payments[$scope.payments.indexOf(payment)] = response.data;
            });
    };
    /**
     * Delete the payment.
     * @param {object} payment
     */
    $scope.delete = function (payment) {
        $scope.payments.splice($scope.payments.indexOf(payment), 1);
        $http.delete('/payments/' + payment.id)
            .then(function (response) {
                $scope.reload($scope.payments.length + 1);
            });
    };

    /**
     * Load more content on 'infiniteScroll' event
     */
    $scope.$on('infiniteScroll', function (event) {
        $scope.loadMore();
    });

    $scope.loadMore();
}]);

app.directive('infiniteScroll', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var elm = element[0];
            element.bind('scroll', function () {
                if (elm.scrollHeight - elm.scrollTop === elm.clientHeight) {
                    scope.$apply(attrs.infiniteScroll);
                }
            });
        }
    }
});

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/index.html',
            controller: 'HomeController'
        })
        .when('/calendar', {
            templateUrl: 'partials/calendar.html',
            controller: 'CalendarController'
        })
        .when('/payments', {
            templateUrl: 'partials/payments.html',
            controller: 'PaymentsController'
        })
        .otherwise({redirectTo: '/'});

    //html5mode causes several issues when the front end is embedded with the web service.
    //$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
}]);