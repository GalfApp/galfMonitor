'use strict';

/**
 *   Módulo que encapsula los controladores se la app.
 *
 *   @author: Sebastián Lara <jlara@kijho.com>
 *   
 *   @created: 17/07/2015
 */

var AppControllers = angular.module('AppControllers', []);

AppControllers.controller('AppController', ['$scope', '$ionicModal', '$cordovaProgress', '$timeout', function($scope, $ionicModal, $cordovaProgress, $timeout) {
    // se inicializa el modulo
    init();

    // se inicializa el modal para el envío de mensajes
    $ionicModal.fromTemplateUrl('templates/newMessage.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        console.log('hide modal! modal');
        // la app deja de cargar
        setLoading(false);
    });

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    /**
     *	Función responsable de abrir el modal con el formulario
     *	para enviar un mensaje a un usuario.
     */
    $scope.newMessage = function(index) {
        // se inicializa el modulo
        init();

        console.log(index);
        // validamos si es un broadcast
        if ($scope.lodash.isEqual(index, -1)) {
            // mensaje para todos
            $scope.data.broadcast = true;
        } else if ($scope.users[index]) {
        	// mensaje para un usuario específico
            $scope.userToMessage = $scope.users[index];
	        
	        // validamos que exista el id de quien va a recibir el mensaje
	        if (!$scope.lodash.isEmpty($scope.userToMessage)) {
	            $scope.data.to.userId = $scope.userToMessage.userId;

	            console.log('$scope.userToMessage')
        		console.log($scope.userToMessage)
	        }
        }

        // validamos que el mensaje vaya para un usuario específico o bien para todos (broadcast)
        if ($scope.data.to.userId || $scope.data.broadcast) {
            console.log('show!')
                // abrimos el modal para enviar el mensaje
            $scope.modal.show();
        } else {
            console.log('userId is empty!')
        }
    }

    /**
     *	Función responsable de enviar un mensaje privado a un usuario
     */
    $scope.sendMessage = function() {
        console.log('send message', $scope.data);
        setLoading(true);

        // validamos que exista el id de quien va a recibir el mensaje
        if (!$scope.lodash.isEmpty($scope.userToMessage) || $scope.data.broadcast) {
            // se envía el mensaje
            var sendMessagePromise = $scope.socket.prototypes.emit.sendMessage($scope.data);

            // quedamos a la espera de la respuesta
            sendMessagePromise.then(function(res) {
                console.log(res);

                if (res.status === 200) {
                    $cordovaProgress.showSuccess(true, "Success!");

                    // se resuelve la promesa, se oculta el loading
                    setLoading(false);

                    // se muestra un mensaje amigable y se cierra el modal
                    // code code code
                    $scope.modal.hide();

                    // ocultamos el success luego de 2 segundos
                    $timeout(function() {
                        $cordovaProgress.hide()
                    }, 2000);
                }
            }, function() {
                // rejected
                console.log('sendMessagePromise rejected!')
                    // la aplicacion termino la operacion
                setLoading(false);
            });
        }
    }

    /**
     *	Función responsable de indicar si el módulo esta o no cargando
     */
    function setLoading(isLoading) {
        // se indica a la app si esta o no cargando
        $scope.isLoading = isLoading;

        if (isLoading) {
            // módulo cargando
            $scope.sendButton = {
                value: "Sending...",
                iconClass: "ion-load-c"
            };
        } else {
            // el módulo deja de cargar
            $scope.sendButton = {
                value: "Send",
                iconClass: "ion-ios-paperplane"
            };
        }
    }

    function init() {
        // estructura de los mensajes que se envían a los usuarios
        $scope.data = {
            from: {
                name: 'SERVER'
            },
            to: {
                userId: ""
            },
            data: {
                title: "Information",
                message: "",
                type: "alert" // alert | warning | success
            },
            broadcast: false // indica si es un mensaje para todos los usuarios conectados
        };

        // usuario al que se le va a enviar el mensaje
        $scope.userToMessage = null;

        // se inicializa la app indicando que no esta cargando
        setLoading(false);
    }

    /**
    *   Función responsable cancelar la opcion de envio de un mensaje
    */
    $scope.cancel = function () {
        // se resetear la información del mensaje
        init()
        // se cierra el modal
        $scope.modal.hide()
    }


}])
