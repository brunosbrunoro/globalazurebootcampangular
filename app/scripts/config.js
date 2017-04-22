app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");

    $stateProvider
        .state('home', {
            url: '/home',
            controller: 'homeController',
            templateUrl: 'views/home.html'
        })
});

