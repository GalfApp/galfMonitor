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
                    console.log('getUsers...')
                    // se emite el evento de inicio de sesion al servidor.
                    socketService.emit('user.list', {}, function(response) {
                        console.log('cb user.list', response)

                        if (response.status === 200) {
                            $rootScope.users = response.data.users
                        } else {
                            console.log('Error onUserList')
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
                        socketService.emit('user.message', data, function(response) {
                            console.log('cb user.message', response);

                            if (response.status === 200) {
                                // se resuelve la promesa
                                resolve(response)
                            } else {
                                reject(response)
                            }
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
            socketService.on('user.join', function(data) {
                console.log('on user.join', data)

                if (data.user) {
                    var userIndex = $rootScope.lodash.findIndex($rootScope.users, { userId: data.user.userId })

                    // se valida que el usuario que se acaba de unir no este ya en el listado
                    if (userIndex > -1) {
                        console.log('joined user alread exists')
                        setTimeout(function() {
                            // si estaba, se actualiza
                            $rootScope.$apply(function() {
                                $rootScope.users[userIndex]._status = data.user._status
                                $rootScope.users[userIndex].deviceToken = data.user.deviceToken
                                console.log('users: ', $rootScope.users)
                            })
                        })
                    } else {
                        console.log('current length: ', $rootScope.users.length)
                        $rootScope.users.splice(0, 0, data.user)
                        console.log('new length: ', $rootScope.users.length)
                        console.log('should length: ', data.usersLength)
                    }

                    // se valida si el tamaño actual del arreglo de usuarios es igual al que llega del server,
                    // si no son iguales entonces se traen nuevamente los los usuarios
                    if (data.usersLength != $rootScope.users.length) {
                        console.log('reload users, %s =! %s', data.usersLength, $rootScope.users.length)
                        socketService.prototypes.emit.getUsers()
                    }
                }
            })

            /**
            *   Evento que se escucha cuando un usuario ha salido a la app.
            */
            socketService.on('user.leave', function(data) {
                console.log('on user.leave', data)

                if (data.user) {
                    // se busca el índice del usuario para eliminarlo
                    var userIndex = $rootScope.lodash.findIndex($rootScope.users, { userId: data.user.userId })

                    if (userIndex > -1) {
                        $rootScope.users.splice(userIndex, 1)
                    } else {
                        console.log('user to leave not found')
                    }

                    if (data.usersLength != $rootScope.users.length) {
                        console.log('reload users, %s =! %s', data.usersLength, $rootScope.users.length)
                        socketService.prototypes.emit.getUsers()
                    }
                } else {
                    console.log('Undefined user has left')
                }
            })

            /**
            *   Evento que actualiza el listado de usuarios online.
            */
            socket.on('user.update', function(data) {
                console.log('on user.update', data);

                if (data.user) {
                    // se busca el índice del usuario para actualizarlo
                    var userIndex = $rootScope.lodash.findIndex($rootScope.users, { userId: data.user.userId })

                    if (userIndex > -1) {
                        $rootScope.$apply(function() {
                            $rootScope.users[userIndex]._status = data.user._status
                            $rootScope.users[userIndex].deviceToken = data.user.deviceToken
                            console.log('users: ', $rootScope.users)
                        })
                    } else {
                        console.log('user to update not found')
                        console.log('users:', $rootScope.users)
                        console.log('user:', data.user)
                        console.log('index:', userIndex)

                        var users2 = [
                          { 'user': 'barney',  'active': false },
                          { 'user': 'fred',    'active': false },
                          { 'user': 'pebbles', 'active': true }
                        ];

                        var index2 = $rootScope.lodash.findIndex(users2, { 'user': 'fred', 'active': false });
                        console.log('index2: ', index2)
                    }
                } else {
                    console.log('Undefined user has left')
                }   
            })

            /**
            *   Evento que se escucha cuando se conecta/desconecta o cambia
            *   de estado (foreground/background) un usuario a la app.
            */
            socketService.on('user.list', function(data) {
                console.log('on user.list', data)

                if (data.users) {
                    $rootScope.users = data.users;
                } else {
                    console.log('undefined users')
                }
            });
        }
    };

    return socketService;
});


