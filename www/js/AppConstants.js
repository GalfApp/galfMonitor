var AppConstants = angular.module('AppConstants', []);

var CONSTANTS = {
    SETTINGS: {
        /**
        *   Configuración de conexión a los servidores
        */
        API: {
            // NODEJS_SERVER: 'http://192.168.0.15:3000'
            NODEJS_SERVER: 'http://162.243.237.248:3000'
        }
    },
    BACKGROUND: 'background',
    FOREGROUND: 'foreground'
}

// constantes de la aplicación
AppConstants.constant('CONSTANTS', CONSTANTS);