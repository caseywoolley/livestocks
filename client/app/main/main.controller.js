'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, socket, Stock) {
    
    $scope.getGraph = Stock.getGraph;
    $scope.stocks = [];
    $scope.stocks_copy = [];
    
    $scope.$watch('syncStocks', function() {
  
      $scope.stocks_copy = $scope.stocks;
   
    });
  

    $http.get('/api/stocks').success(function(stocks) {
      $scope.stocks = stocks;
      socket.syncUpdates('stock', $scope.stocks);
    });

    $scope.addStock = function() {
      if($scope.symbol === '') {
        return;
      }
      $scope.symbol = $scope.symbol.toUpperCase();
      
      //get stock data then append to stock object
      $scope.getGraph( $scope.symbol ).then(function(data){ 
        
        $http.post('/api/stocks', { symbol: $scope.symbol, data: data }).success(function(newStock){
          //TODO: append stock json to new stock
          
        });
        $scope.symbol = '';
      });
      
    };

    $scope.deleteStock = function(stock) {
      $http.delete('/api/stocks/' + stock._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
  
      
    /*
    $scope.getGraph('AAPL');
    $scope.getGraph('GOOG');
    $scope.getGraph('TSLA');
    $scope.getGraph('FB');
    */
