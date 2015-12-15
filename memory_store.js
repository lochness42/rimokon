var MemoryStore = function() {
  var routingObject
  var requestHistoryObject
  var bluebird = require('bluebird');

  this.init = function(config){
    routingObject = {}
    requestHistoryObject = {}
  }

  this.add_route = function(method, route, response_code, header, body) {
    if (!routingObject.hasOwnProperty(route)){
      routingObject[route] = {}
    }
    routingObject[route][method] = {
      'route' : route,
      'method' : method,
      'header' : header,
      'body' : body,
      'response_code': response_code
    }
    return new Promise(function(resolve, reject){
      resolve(routingObject[route][method]);
    })
  }

  this.find_route = function(method, route) {
    return new Promise(function(resolve, reject){
      if (routingObject.hasOwnProperty(route)){
        if (routingObject[route].hasOwnProperty(method)){
          resolve(routingObject[route][method])
        } else {
          reject('Method for route not found');        
        }
      } else {
        reject('Route not found');        
      }
    })
  }

  this.delete_route = function(method, route) {
    return new Promise(function(resolve, reject){
      if (routingObject.hasOwnProperty(route)){
        if (routingObject[route].hasOwnProperty(method)){
          delete routingObject[route][method]
          resolve({})
        } else {
          reject('Method for route not found');
        }
      } else {
        reject('Route not found');        
      }
    })
  }

  this.delete_all_routes = function() {
    return new Promise(function(resolve, reject){
      routingObject = {}
      resolve(routingObject);
    })
  }

  this.save_last_request_for_route = function(method, route, header, body) {
    return new Promise(function(resolve, reject){
      var request = {
        'route' : route,
        'method' : method,
        'header' : header,
        'body' : body,
      }
      if (!requestHistoryObject.hasOwnProperty(route)){
        requestHistoryObject[route] = {}
      }

      if (requestHistoryObject.hasOwnProperty(route)){
        if (requestHistoryObject[route].hasOwnProperty(method)){
           return requestHistoryObject[route][method].push(request)
        }
        else {
          requestHistoryObject[route][method] = [request]
        }
      }

      console.log(requestHistoryObject);
      resolve(requestHistoryObject);
    })
  }

  this.find_last_request_for_route = function(method, route) {
    return new Promise(function(resolve, reject){
      if (requestHistoryObject.hasOwnProperty(route)){
        if (requestHistoryObject[route].hasOwnProperty(method)){
          var request_history = requestHistoryObject[route][method]
          resolve(request_history[request_history.length - 1])
        } else {
          reject('Method for route not found');        
        }
      } else {
        reject('Route not found');        
      }
    })
  }

  this.find_all_requests_for_route = function(method, route) {
    return new Promise(function(resolve, reject){
      if (requestHistoryObject.hasOwnProperty(route)){
        if (requestHistoryObject[route].hasOwnProperty(method)){
          resolve(requestHistoryObject[route][method])
        } else {
          reject('Method for route not found');        
        }
      } else {
        reject('Route not found');        
      }
    })
  }

  this.delete_request_history = function() {
    return new Promise(function(resolve, reject){
      requestHistoryObject = {}
      resolve(routingObject);
    })
  }

};

module.exports = new MemoryStore();
