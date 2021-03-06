chromeMyAdmin.factory("typeService", ["$rootScope", "TypeMap", function($rootScope, TypeMap) {
    "use strict";

    var types = [];

    for (var type in TypeMap) {
        types.push(type);
    }

    return {
        getTypes: function() {
            return types;
        },
        isString: function(type) {
            var info = TypeMap[type];
            return info.isString;
        },
        isNumeric: function(type) {
            var info = TypeMap[type];
            return info.isNumeric;
        }
    };

}]);
