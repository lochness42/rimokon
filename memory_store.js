var MemoryStore = function() {
  var routingObject
  var requestHistoryObject

  this.init = function(){
    routingObject = {}
    requestHistoryObject = {}
  }

  this.add_route = function(method, route, response_code, header, body) {
    routingObject[method + '||' + route] = {
      'header' : header,
      'body' : body,
      'response_code': response_code
    }
  }

  this.find_route = function(method, route) {
    var routing_key = method + '||' + route
    if (routingObject.hasOwnProperty(routing_key)){
      return routingObject[routing_key]
    }
    return undefined
  }

  this.delete_route = function(method, route) {
    var routing_key = method + '||' + route
    if (routingObject.hasOwnProperty(routing_key)){
      delete routingObject[routing_key]
    }
  }

  this.delete_all_routes = function() {
    routingObject = {}
  }

  this.save_last_request_for_route = function(method, route, header, body) {
    var routing_key = method + '||' + route
    var request = {
      'header' : header,
      'body' : body,
    }
      if (requestHistoryObject.hasOwnProperty(routing_key)){
        requestHistoryObject[routing_key].push(request)
    } else {
        requestHistoryObject[routing_key] = [request]
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
    var routing_key = method + '||' + route
      if (requestHistoryObject.hasOwnProperty(routing_key)){
      return requestHistoryObject[routing_key]
    } else {
      return undefined
    }
  }

  this.delete_request_history = function() {
    requestHistoryObject = {}
  }

};

module.exports = new MemoryStore();
