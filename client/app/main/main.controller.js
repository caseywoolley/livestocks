'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];
    
    var dateToString = function(date){
       var yyyy = date.getFullYear().toString();
       var mm = (date.getMonth()+1).toString();
       var dd  = date.getDate().toString();
       return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
    };
    
    var today = new Date();
    var yesterday = new Date(today);
    var lastYear = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    lastYear.setDate(today.getDate() - 365);
    

    console.log(dateToString(yesterday));
    // Define variables
    $scope.graphData = [];
    var symbol = 'AAPL';
    var startDate = dateToString(lastYear);
    var endDate = dateToString(yesterday);
    $scope.example = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata' +
    '%20where%20symbol%20%3D%20%22AAPL%22%20and%20startDate%20%3D%20%222012-09-11%22%20and%20'+
    'endDate%20%3D%20%222014-02-11%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2F'+
    'alltableswithkeys&callback='
    
    $scope.live = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22AAPL%22)&format=json&env=store://datatables.org/alltableswithkeys&callback=';
    $scope.googleLive = 'http://finance.google.com/finance/info?client=ig&q=NASDAQ:GOOG,NASDAQ:YHOO,NASDAQ:AAPL';
    
    
    var query = 'select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "' + startDate + '" and endDate = "' + endDate + '"';
    var yqlAPI = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
    $scope.url = yqlAPI;
    
    $.getJSON(yqlAPI, function(r) {
        var symbol = r.query.results.quote[0].Symbol;
        
        r.query.results.quote.forEach(function(data, i){
          $scope.graphData.push([new Date(data.Date), parseFloat(data.Close)]);
        });
        console.log($scope.graphData);
        console.log($scope.graphData[0][0]);
        console.log(r);
        
        //generate graph
        var g2 = new Dygraph(document.getElementById("graphdiv2"),
          $scope.graphData.reverse() ,
            {
              labels: ['Date', symbol],
              title: 'Stock Prices',
              ylabel: 'Price',
              legend: 'always',
              labelsDivStyles: { 'textAlign': 'right' },
              showRangeSelector: true,
              rangeSelectorPlotStrokeColor: '#9BDBED',
              rangeSelectorPlotFillColor: '#CAEFFA'
              
            }          
          );
    });
    
    
    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
