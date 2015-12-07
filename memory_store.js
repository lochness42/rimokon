var MemoryStore = function() {
  var routingObject
  var requestHistoryObject

  this.init = function(){
    routingObject = {}
    requestHistoryObject = {}
  }

  this.add_route = function(method, route, response_code, header, body) {
    if (!routingObject.hasOwnProperty(route)){
      routingObject[route] = {}
    }
    routingObject[route][method] = {
      'header' : header,
      'body' : body,
      'response_code': response_code
    }
  }

  this.find_route = function(method, route) {
    if (routingObject.hasOwnProperty(route)){
      if (routingObject[route].hasOwnProperty(method)){
         return routingObject[route][method]
      }
    }
    return undefined
  }

  this.delete_route = function(method, route) {
    if (routingObject.hasOwnProperty(route)){
      if (routingObject[route].hasOwnProperty(method)){
         delete routingObject[route][method]
      }
    }
  }

  this.delete_all_routes = function() {
    routingObject = {}
  }

  this.save_last_request_for_route = function(method, route, header, body) {
    var request = {
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
  }

  this.find_last_request_for_route = function(method, route) {
    var routeHistory = this.find_all_requests_for_route(method, route)
      if (routeHistory != undefined){
      return routeHistory[routeHistory.length - 1]
    } else {
      return undefined
    }
  }

  this.find_all_requests_for_route = function(method, route) {
    if (requestHistoryObject.hasOwnProperty(route)){
      if (requestHistoryObject[route].hasOwnProperty(method)){
         return requestHistoryObject[route][method]
      }
    }
    return undefined
  }

  this.delete_request_history = function() {
    requestHistoryObject = {}
  }

};

module.exports = new MemoryStore();
