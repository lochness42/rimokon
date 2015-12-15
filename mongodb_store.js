var MongodbStore = function() {
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  mongoose.Promise = require('bluebird');

  
  var routeSchema = new Schema({
    route: String, 
    method: String, 
    response_code: Number, 
    header: Schema.Types.Mixed, 
    body: Schema.Types.Mixed
  });
  
  var RouteObject = mongoose.model('RouteObject', routeSchema)

  var historySchema = new Schema({
    route: String, 
    method: String, 
    header: Schema.Types.Mixed, 
    body: Schema.Types.Mixed,
    added: { type: Date, default: Date.now },
  });

  var HistoryObject = mongoose.model('HistoryObject', historySchema)


  var routingObject
  var requestHistoryObject

  this.init = function(){
    mongoose.connect('mongodb://username:password@databaseUrl');
  }

  this.add_route = function(method, route, response_code, header, body) {
    var new_route = {
      route: route, 
      method: method, 
      response_code: response_code, 
      header: header, 
      body: body
    }

    return RouteObject.findOneAndUpdate({'route': route, 'method': method}, new_route, {upsert:true})
  }

  this.find_route = function(method, route) {
    return RouteObject.findOne({route: route, method: method})
  }

  this.delete_route = function(method, route) {
    return RouteObject.remove({route: route, method: method})
  }
  this.delete_all_routes = function() {
    return RouteObject.remove()
  }

  this.save_last_request_for_route = function(method, route, header, body) {
    var new_history = new HistoryObject({
      route: route, 
      method: method, 
      header: header, 
      body: body
    })
    return new_history.save()
  }

  this.find_last_request_for_route = function(method, route) {
    return HistoryObject.findOne({route: route, method: method}, null, {sort:{ added: -1 }})
  }

  this.find_all_requests_for_route = function(method, route) {
    return HistoryObject.find({route: route, method: method})
  }

  this.delete_request_history = function() {
    return HistoryObject.remove()
  }

};

module.exports = new MongodbStore();
