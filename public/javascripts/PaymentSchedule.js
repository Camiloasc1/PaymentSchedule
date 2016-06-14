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

app.controller('HomeController', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
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
     * State of the animation in switchThemes.
     * @type {boolean}
     */
    $scope.flashTheme = false;
    /**
     * Today at midnight.
     * @type {Date}
     */
    $scope.today = new Date();
    $scope.today.setHours(0, 0, 0, 0);
    /**
     * Tomorrow.
     * @type {Date}
     */
    $scope.tomorrow = new Date($scope.today);
    $scope.tomorrow.setDate($scope.tomorrow.getDate() + 1);
    /**
     * The next 7 days.
     * @type {Date}
     */
    $scope.oneWeek = new Date($scope.today);
    $scope.oneWeek.setDate($scope.oneWeek.getDate() + 7);

    /**
     * Reload all payments shown.
     */
    $scope.reload = function () {
        $scope.loading = true;
        $http.get('/payments/next', {
            params: {before: $scope.oneWeek}
        })
            .then(function (response) {
                $scope.payments = response.data;
                $scope.switchThemes();
                $scope.loading = false;
            });
    };
    /**
     * Set to paid the next pending payment.
     * @param {object} payment
     */
    $scope.pay = function (payment) {
        //Are there next payments?
        if (!payment.payments.next)
            return;
        //Find the next pending payment.
        var index = payment.payments.status.indexOf(false);
        if (index === -1)
            return;
        //Set to paid the next pending payment.
        payment.payments.status[index] = true;
        $scope.update(payment);
    };
    /**
     * Update a payment
     * @param {object} payment
     */
    $scope.update = function (payment) {
        $http.put('/payments/' + payment.id, payment)
            .then(function (response) {
                $scope.reload();
                // Is easier to reload instead of check the next payment and sort again.
                // var index = $scope.payments.indexOf(payment);
                // if (index !== -1)
                //     if (response.data.payments.next && new Date(response.data.payments.next) < $scope.oneWeek)
                //         $scope.payments[index] = response.data;
                //     else
                //         $scope.payments.splice(index, 1);
            });
    };
    /**
     * Change color of payments
     * Before today: red-orange
     * Today: indigo
     * Tomorrow: cyan
     * After tomorrow: none
     */
    $scope.switchThemes = function () {
        var payment;
        $scope.flashTheme = !$scope.flashTheme;
        for (var i = 0; i < $scope.payments.length; i++) {
            payment = $scope.payments[i];
            if (typeof payment.date === 'string')
                payment.date = new Date(payment.date);
            if (payment.date < $scope.today)
                payment.theme = $scope.flashTheme ? 'red' : 'orange';
            // Check equals require to compare the time value, not the objects itself. Like comparing floats.
            if (payment.date.getTime() === $scope.today.getTime())
                payment.theme = 'indigo';
            if (payment.date.getTime() === $scope.tomorrow.getTime())
                payment.theme = 'cyan';
            if (payment.date > $scope.tomorrow)
                payment.theme = '';
        }
    };

    /**
     * Change color of payments
     */
    $interval($scope.switchThemes, 1000);

    $scope.reload();
}]);

app.controller('CalendarController', ['$scope', function ($scope) {
}]);

app.controller('PaymentsController', ['$scope', '$http', '$mdDialog', function ($scope, $http, $mdDialog) {
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
     * The current search query.
     * @type {string}
     */
    $scope.query = "";
    /**
     * Layout for a new payment.
     * @type {object}
     */
    $scope.layout = {
        name: "Nuevo Pago",
        date: new Date(),
        recurrence: {"period": "day", "delta": "1", "limit": 1}
    };
    //Clear hours.
    $scope.layout.date.setHours(0, 0, 0, 0);

    /**
     * Load more payments.
     */
    $scope.loadMore = function () {
        // Avoid to load the same payments more than once.
        if ($scope.loading)
            return;
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
     * Search payments
     */
    $scope.search = function () {
        $scope.loading = true;
        $http.get('payments/search', {
            params: {query: $scope.query}
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
        //Are there next payments?
        if (!payment.payments.next)
            return;
        //Find the next pending payment.
        var index = payment.payments.status.indexOf(false);
        if (index === -1)
            return;
        //Set to paid the next pending payment.
        payment.payments.status[index] = true;
        $scope.update(payment);
    };
    /**
     * Add a new payment and switch to edit mode.
     */
    $scope.add = function () {
        $http.post('/payments', $scope.layout)
            .then(function (response) {
                var payment = response.data;
                $scope.payments.push(payment);
                $scope.edit(payment);
            });
    };
    /**
     * Open a dialog for edit a payment.
     * @param {object} payment
     */
    $scope.edit = function (payment) {
        var index = $scope.payments.indexOf(payment);
        //Use a copy of the original.
        payment = jQuery.extend(true, {}, payment);
        var dialog = {
            controller: function ($scope, $mdDialog) {
                $scope.cancel = $mdDialog.cancel;
                $scope.hide = $mdDialog.hide;
                $scope.payment = payment;

                //Parse values to correct types.
                $scope.payment.date = new Date($scope.payment.date);
                $scope.payment.recurrence.delta = Number($scope.payment.recurrence.delta);

                $scope.periods = [
                    {value: 'day', name: 'Dia'},
                    {value: 'week', name: 'Semana'},
                    {value: 'month', name: 'Mes'},
                    {value: 'year', name: 'Año'}
                ];
            },
            templateUrl: 'partials/paymentDialog.html',
            clickOutsideToClose: true
        };
        $mdDialog.show(dialog)
            .then(function () {
                $scope.payments[index] = payment;
                $scope.update(payment);
            }, function () {
                //Do nothing on cancel.
            });
    };
    /**
     * Update a payment
     * @param {object} payment
     */
    $scope.update = function (payment) {
        $http.put('/payments/' + payment.id, payment)
            .then(function (response) {
                var index = $scope.payments.indexOf(payment);
                if (index !== -1)
                    $scope.payments[index] = response.data;
            });
    };
    /**
     * Confirm if delete a payment.
     * @param {object} payment
     */
    $scope.deletePrompt = function (payment) {
        var dialog = $mdDialog.confirm()
            .title('¿Borrar pago?')
            .textContent('¿Estas seguro de que quieres borrar este pago?.')
            .clickOutsideToClose(true)
            .ok('Borrar')
            .cancel('Cancelar');
        $mdDialog.show(dialog)
            .then(function () {
                $scope.delete(payment);
            }, function () {
                //Do nothing on cancel.
            });
    };
    /**
     * Delete a payment.
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
     * Watch for a search query
     */
    $scope.$watch('query', function () {
        if ($scope.query.length === 0) {
            //Do not load twice.
            if (!$scope.loading) {
                $scope.payments = [];
                $scope.loadMore();
            }
        } else {
            $scope.search();
        }
    });

    /**
     * Load more content on 'infiniteScroll' event
     */
    $scope.$on('infiniteScroll', function (event) {
        $scope.loadMore();
    });

    $scope.loadMore();
}]);

app.controller('PaymentDialogController', ['$scope', '$mdDialog', function ($scope, $mdDialog, payment) {
    $scope.cancel = $mdDialog.cancel;
    $scope.hide = $mdDialog.hide;
    console.log($scope);
    console.log($scope.payment);
    console.log($mdDialog);
    console.log(payment);
    $scope.payment = payment;
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

app.config(['$locationProvider', '$routeProvider', '$mdThemingProvider', function ($locationProvider, $routeProvider, $mdThemingProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
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

    $mdThemingProvider.theme('orange').backgroundPalette('orange').dark();
    $mdThemingProvider.theme('red').backgroundPalette('red').dark();
    $mdThemingProvider.theme('indigo').backgroundPalette('indigo').dark();
    $mdThemingProvider.theme('cyan').backgroundPalette('cyan').dark();
}]);