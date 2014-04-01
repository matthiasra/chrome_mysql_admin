"use strict";

chromeMyAdmin.controller("DatabasePanelController", ["$scope", "mySQLClientService", "modeService", "$timeout", function($scope, mySQLClientService, modeService, $timeout) {

    var autoUpdatePromise = null;

    var _isDatabasePanelVisible = function() {
        return mySQLClientService.isConnected()
            && modeService.getMode() === "database";
    };

    var initializeProcessListGrid = function() {
        resetProcessListGrid();
        $scope.processListGrid = {
            data: "processListData",
            columnDefs: "processListColumnDefs",
            enableColumnResize: true,
            enableSorting: false,
            headerRowHeight: 25,
            rowHeight: 25
        };
    };

    var resetProcessListGrid = function() {
        $scope.processListColumnDefs = [];
        $scope.processListData = [];
    };

    var assignWindowResizeEventHandler = function() {
        $(window).resize(function(evt) {
            adjustProcessListHeight();
        });
    };

    var adjustProcessListHeight = function() {
        $("#processListGrid").height($(window).height() - 126);
    };

    var onModeChanged = function(mode) {
        if (mode === "database") {
            loadProcessList();
        } else {
            stopAutoUpdate();
        }
    };

    var stopAutoUpdate = function() {
        if (autoUpdatePromise) {
            $timeout.cancel(autoUpdatePromise);
            autoUpdatePromise = null;
        }
    };

    var onConnectionChanged = function() {
        if (!mySQLClientService.isConnected()) {
            stopAutoUpdate();
        }
    };

    var loadProcessList = function() {
        mySQLClientService.getStatistics().then(function(statistics) {
            $scope.statistics = statistics;
            return mySQLClientService.query("SHOW PROCESSLIST");
        }).then(function(result) {
            if (result.hasResultsetRows) {
                $scope.safeApply(function() {
                    updateProcessListColumnDefs(result.columnDefinitions);
                    updateProcessList(result.columnDefinitions, result.resultsetRows);
                    autoUpdatePromise = $timeout(loadProcessList, 10000);
                });
            } else {
                $scope.fatalErrorOccurred("Retrieving process list failed.");
            }
        }, function(reason) {
            $scope.fatalErrorOccurred(reason);
        });
    };

    var updateProcessListColumnDefs = function(columnDefinitions) {
        var columnDefs = [];
        angular.forEach(columnDefinitions, function(columnDefinition) {
            this.push({
                field: columnDefinition.name,
                displayName: columnDefinition.name,
                width: Math.min(Number(columnDefinition.columnLength) * 14, 300)
            });
        }, columnDefs);
        $scope.processListColumnDefs = columnDefs;
    };

    var updateProcessList = function(columnDefinitions, resultsetRows) {
        var rows = [];
        angular.forEach(resultsetRows, function(resultsetRow) {
            var values = resultsetRow.values;
            var row = {};
            angular.forEach(columnDefinitions, function(columnDefinition, index) {
                row[columnDefinition.name] = values[index];
            });
            rows.push(row);
        });
        $scope.processListData = rows;
    };

    $scope.initialize = function() {
        $scope.$on("modeChanged", function(event, mode) {
            onModeChanged(mode);
        });
        $scope.$on("connectionChanged", function(event, data) {
            onConnectionChanged();
        });
        initializeProcessListGrid();
        assignWindowResizeEventHandler();
        adjustProcessListHeight();
    };

    $scope.isDatabasePanelVisible = function() {
        return _isDatabasePanelVisible();
    };

}]);