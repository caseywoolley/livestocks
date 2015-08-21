'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StockSchema = new Schema({
  symbol: String,
  data: Object,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Stock', StockSchema);