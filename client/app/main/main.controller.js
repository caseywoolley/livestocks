'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.stocks = [];
    
    var graphData = {}; //move variable and functions to service
    var labels = ['Date'];
    var view = "Percent Change";
    
    //url examples - save for later
    $scope.example = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata' +
    '%20where%20symbol%20%3D%20%22AAPL%22%20and%20startDate%20%3D%20%222012-09-11%22%20and%20'+
    'endDate%20%3D%20%222014-02-11%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2F'+
    'alltableswithkeys&callback=';
    
    $scope.live = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22AAPL%22)&format=json&env=store://datatables.org/alltableswithkeys&callback=';
    $scope.googleLive = 'http://finance.google.com/finance/info?client=ig&q=NASDAQ:GOOG,NASDAQ:YHOO,NASDAQ:AAPL';
    
    
    
    var dateToString = function(date){
       var yyyy = date.getFullYear().toString();
       var mm = (date.getMonth()+1).toString();
       var dd  = date.getDate().toString();
       return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
    };
    
    getGraph('AAPL');
    getGraph('GOOG');
    getGraph('TSLA');
    getGraph('FB');
    
    function getGraph(symbol) {
      var today = new Date();
      var yesterday = new Date(today);
      var lastYear = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      lastYear.setDate(today.getDate() - 365);
      
      var startDate = dateToString(lastYear);
      var endDate = dateToString(yesterday);
      var query = 'select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "' + startDate + '" and endDate = "' + endDate + '"';
      var yqlAPI = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
      $scope.url = yqlAPI; //not needed
      
      $.getJSON(yqlAPI, function(r) {
          //TODO: save json with ticker symbol model
          
          //add json to graph
          drawGraphs(parseGraphData(r, view));
      });
    }
    
    function parseGraphData(graphJson, view){
      //TODO: make graphJson an array
      var startingValue = graphJson.query.results.quote[graphJson.query.results.quote.length -1].Close;
      
      graphJson.query.results.quote.forEach(function(data){
        if (labels.indexOf(data.Symbol) === -1){
          labels.push(data.Symbol);
        }
        if (!graphData[data.Date]) {
          graphData[data.Date] = [ new Date(data.Date) ];
        } 
        if (view === 'Closing Price') {
          graphData[data.Date].push( parseFloat(data.Close) );
        } else if (view === 'Percent Change') {
          graphData[data.Date].push( ((parseFloat(data.Close) - startingValue) / startingValue) * 100 );
        }
        
      });
      
      
      var graphs = [];
      for (var row in graphData) {
        graphs.push(graphData[row]);
      }
      graphs = graphs.reverse();
      /*
      console.log(labels);
      console.log(graphData);
      console.log(graphJson);
      console.log(graphs);
      */
      return graphs;
    }
    
    function drawGraphs(graphData) {
      var g2 = new Dygraph(document.getElementById("graphdiv2"),
              graphData ,
              {
                labels: labels,
                strokeWidth: 1,
                //title: view,
                ylabel: view,
                axes: {
                  x: {
                    //axisLabelFormatter: function(d) { return d.getFullYear() },
                    valueFormatter: function(ms) { return new Date(ms) }
                  }
                },
                legend: 'always',
                labelsDivStyles: { 'textAlign': 'right' },
                showRangeSelector: true,
                rangeSelectorPlotStrokeColor: '#9BDBED',
                rangeSelectorPlotFillColor: '#CAEFFA'
                
              });
    }
    
  
    
    $http.get('/api/stocks').success(function(stocks) {
      $scope.stocks = stocks;
      socket.syncUpdates('stock', $scope.stocks);
    });

    $scope.addStock = function() {
      if($scope.newStock === '') {
        return;
      }
      $http.post('/api/stocks', { name: $scope.newStock });
      $scope.newStock = '';
    };

    $scope.deleteStock = function(stock) {
      $http.delete('/api/stocks/' + stock._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
