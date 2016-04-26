'use strict';

/**
*   Servicio encargado de los eventos real-time.
*/

AppServices.factory('SocketService', function socket($rootScope/*, $cordovaToast*/, $q) {
    // se conecta el socket al servidor
    var socket = io.connect(CONSTANTS.SETTINGS.API.NODEJS_SERVER)
    
    var socketService = {
        /**
        *   Función genérica para recibir mensajes del servidor.
        */
        on: function(eventName, callback) {
            console.log('on:%s', eventName);

            socket.on(eventName, function() {
                var args = arguments;

                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },

        /**
        *   Función genérica para enviar mensajes al servidor.
        */
        emit: function(eventName, data, callback) {
            console.log('emit:%s', eventName);
            console.log('emit:data', data);

            socket.emit(eventName, data, function() {
                var args = arguments;

                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },

        /**
        *   Funciones real-time genéricas para la aplicación
        */
        prototypes: {
            /**
            *   Eventos que se emiten desde el cliente al servidor
            */
            emit: {
                /**
                *   Función responsable de emitir el evento "getUsers" al servidor real-time
                *   para obtener todos los usuarios conectados en la app.
                */
                getUsers: function() {
                    console.log('getUsers OK!')
                    // se emite el evento de inicio de sesion al servidor.
                    socketService.emit('user.list', {}, function(res) {
                        console.log('user.list callback');
                        console.log(res);

                        if (res.status === 200) {
                            $rootScope.users = res.data.users;
                        }
                    });
                },

                /**
                *   Función responsable de emitir el evento "user.message" para enviar
                *   un mensaje a un usuario en específico.
                */
                sendMessage: function (data) {
                    return $q(function(resolve, reject) {
                        // se emite el evento de enviar el mensaje privado
                        socketService.emit('user.message', data, function(res) {
                            console.log('user.message callback');
                            console.log(res);
                            // se resuelve la promesa
                            resolve(res);
                        });
                    });
                }
            }            
        },

        /**
        *   Eventos que escucha el cliente del servidor.
        */
        startListeners: function() {
            console.log('startListeners OK!');
            /**
            *   Evento que se activa cuando el servidor real-time entra al estado
            *   online.
            */
            socketService.on("connect", function(data) {
                console.log('real-time server connected!');
                console.log(data);
                // se consultan los usuarios
                socketService.prototypes.emit.getUsers();
            });

            /**
            *   Evento que se activa cuando el servidor real-time entra al estado
            *   offline.
            */
            socketService.on('disconnect', function () {
                console.log('real-time server disconnect.');                
            })

            /**
            *   Evento que se escucha cuando un usuario ha ingresado a la app.
            */
            socketService.on('user.join', function(res) {
                console.log('user.join');
                console.log(res);

                var user = res.user || null;
                var users = res.users || null;

                if (user.userId) {
                    console.log(user)
                    // se muestra un toast informando que un nuevo usuario ha entrado
                    console.log(user.name + ' ' + user.lastname + ' is online');
                    /*$cordovaToast
                    .show(user.name + ' ' + user.lastname + ' (' + user.dealer.dbaName + ') is online', 'long', 'center')
                    .then(function(success) {
                        // success
                        console.log('success toast', success)
                    }, function (error) {
                        // error
                        console.log('error toast', error)
                    });*/
                }

                if (users.status === 200) {
                    $rootScope.users = users.data.users;
                }
            });

            /**
            *   Evento que se escucha cuando un usuario ha salido a la app.
            */
            socketService.on('user.leave', function(res) {
                console.log('user.leave');
                console.log(res);

                var user = res.user || null;
                var users = res.users || null;

                if (user.userId) {
                    console.log(user)
                    // se muestra un toast informando que un nuevo usuario ha entrado
                    console.log(user.name + ' ' + user.lastname + ' has left');
                    // $cordovaToast
                    // .show(user.name + ' ' + user.lastname + ' (' + user.dealer.dbaName + ') has left', 'long', 'center')
                    // .then(function(success) {
                    //   // success
                    // }, function (error) {
                    //   // error
                    // });
                }

                if (users.status === 200) {
                    $rootScope.users = users.data.users;
                }
            });

            /**
            *   Evento que se escucha cuando se conecta/desconecta o cambia
            *   de estado (foreground/background) un usuario a la app.
            */
            socketService.on('user.list', function(res) {
                console.log('on user.list');
                console.log(res);

                if (res.status === 200) {
                    $rootScope.users = res.data.users;
                }
            });
        }
    };

    return socketService;
});


