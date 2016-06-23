// Ionic Starter App

angular.module('starter', [
    'ionic', 
    'AppConstants', 
    'AppControllers', 
    'AppServices', 
    'ngCordova',
    'ngLodash'
])

.run(function($rootScope, $ionicPlatform, SocketService, $timeout, CONSTANTS, $cordovaNetwork, lodash) {
    $ionicPlatform.ready(function() {
        /**
        *   Config
        */
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent()
        }

        /**
        * System vars
        */
        $rootScope.CONSTANTS = CONSTANTS
        // socket conectado al server de bmak
        $rootScope.socket = SocketService
        // información de la red
        $rootScope.networkInformation = {
            type: $cordovaNetwork.getNetwork(),
            isOnline: $cordovaNetwork.isOnline(),
            isOffline: $cordovaNetwork.isOffline()
        };
        // utilidades
        $rootScope.lodash = lodash
        // variable que indica si la app esta cargando
        $rootScope.isLoading = false


        /**
        * Global vars
        */
        // usuarios conectados en la app
        $rootScope.users = [];
        // contador de usuarios online
        $rootScope.onlineUsersCount = 0
        // contador de usuarios ausentes
        $rootScope.awayUsersCount = 0
        // se escuchan los eventos del servidor real-time
        $rootScope.socket.startListeners()
        // se realiza la petición de todos los usuarios conectados
        $rootScope.socket.prototypes.emit.getUsers()

        /**
        *   Events
        */
        document.addEventListener("pause", function () {
            console.log('onPause fired!');
            
        }, false);

        document.addEventListener("resume", function () {
            console.log('onResume fired!');
            // se mantiene la lista de usuarios actualizada
            $rootScope.socket.prototypes.emit.getUsers();
        }, false);

        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
            console.log('$cordovaNetwork:online: ', networkState);
            $rootScope.networkInformation = {
                type: networkState,
                isOnline: true,
                isOffline: false
            }
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
            console.log('$cordovaNetwork:offline: ', networkState);
            $rootScope.networkInformation = {
                type: networkState,
                isOnline: false,
                isOffline: true
            };

            $rootScope.users = [];
        })

        /**
        *   Listener a la escucha de un cambio en los usuarios para mantener
        *   actualizada la app.
        */
        $rootScope.$watchCollection('users', function(newUsers, oldUsers) {
            console.log('users change')

            var onlineUsers = 0;
            var awayUsers = 0;

            // se recorren los nuevos datos para saber la cantidad de usuarion en linea y ausentes
            angular.forEach(newUsers, function(user) {
                console.log(user);
                if (angular.equals(user._status.state, CONSTANTS.FOREGROUND)) {
                    ++onlineUsers;
                } else if (angular.equals(user._status.state, CONSTANTS.BACKGROUND)) {
                    ++awayUsers;
                }
            });

            // se actualiza tanto la cantidad de usuarios en linea como los ausentes.
            $rootScope.onlineUsersCount = onlineUsers;
            $rootScope.awayUsersCount = awayUsers;
        });

    });
})

.config(function($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html'
            }
        }
    })

    .state('tab.users', {
        url: '/users',
        views: {
            'tab-users': {
                templateUrl: 'templates/tab-users.html'
            }
        }
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
});
