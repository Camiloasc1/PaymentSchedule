var app = angular.module('PaymentSchedule', ['ngRoute', 'ngMaterial']);

app.controller('NavigationController', ['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
    $scope.toggleSideNav = function () {
        $mdSidenav('sidenav').toggle();
    };
    $scope.message = 'Hello from HomeController';
}]);

app.controller('HomeController', ['$scope', function ($scope) {
    $scope.message = 'Hello from HomeController';
}]);

app.controller('CalendarController', ['$scope', function ($scope) {
    $scope.message = 'Hello from BlogController';
}]);

app.controller('PaymentController', ['$scope', function ($scope) {
    $scope.message = 'Hello from AboutController';
}]);

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
        .when('/payment', {
            templateUrl: 'partials/payment.html',
            controller: 'PaymentController'
        })
        .otherwise({redirectTo: '/'});

    //html5mode causes several issues when the front end is embedded with the web service.
    //$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
}]);