"use strict";
var app = angular.module('PaymentSchedule', ['ngRoute', 'ngMaterial']);

app.controller('NavigationController', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
    $scope.toggleSideNav = function () {
        $mdSidenav('sidenav').toggle();
    };
    $scope.infiniteScroll = function () {
        $scope.$broadcast('infiniteScroll');
    };
}]);

app.controller('HomeController', ['$scope', function ($scope) {
}]);

app.controller('CalendarController', ['$scope', function ($scope) {

}]);

app.controller('PaymentController', ['$scope', '$http', function ($scope, $http) {
    $scope.chunk = 5;
    $scope.payments = [];
    $scope.loading = false;

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
    $scope.reload = function () {
        $scope.loading = true;
        $http.get('/payments', {
            params: {skip: 0, limit: $scope.payments.length}
        })
            .then(function (response) {
                $scope.payments = response.data;
                $scope.loading = false;
            });
    };

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
            controller: 'PaymentController'
        })
        .otherwise({redirectTo: '/'});

    //html5mode causes several issues when the front end is embedded with the web service.
    //$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
}]);