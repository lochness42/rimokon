var PostgresStore = function() {
	var routingObject
	var requestHistoryObject

	this.init = function(){
		routingObject = {}
		requestHistoryObject = {}
	}

	this.add_route = function(method, route, response_code, header, body) {
		return undefined
	}

  this.find_route = function(method, route) {
	  return undefined
  }

  this.delete_route = function(method, route) {
	  return undefined
  }

  this.delete_all_routes = function() {
	  return undefined
  }

  this.save_last_request_for_route = function(method, route, header, body) {
	  return undefined
  }

	this.find_last_request_for_route = function(method, route) {
	  return undefined
  }

	this.find_all_requests_for_route = function(method, route) {
	  return undefined
  }

  this.delete_request_history = function() {
	  return undefined
  }

};

module.exports = new PostgresStore();
