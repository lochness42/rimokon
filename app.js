var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Define store object
//var data_storage = require('./postgres_store.js')
//var data_storage = require('./memory_store.js')
var data_storage = require('./mongodb_store.js')

data_storage.init()

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.all('/create_route', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method')
  var response_code = req.get('response_code')
  var this_response = ''
  var response_header = req.headers

  if(route === undefined){
    this_response += 'Route is not defined\n'
  } else {
    delete response_header.route
  }
  if(response_code === undefined){
    this_response += 'Response code is not defined\n'
  } else {
    delete response_header.response_code
  }
  if(request_method === undefined){
    this_response += 'Method is not defined\n'

  } else {
    request_method = request_method.toUpperCase()
    delete response_header.request_method
  }

  if(this_response != ''){
    res.status(400).send(this_response)
  } else {
    data_storage.add_route(request_method, route, response_code, response_header, req.body)
    .then(function(data){
      console.log(data)
      res.status(200).send(data)
    })
    .catch(function(error){
      console.log(error)
      res.status(400).send(error)
    })
  }
});

app.all('/delete_routes', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method')
  res.status(200)

  if(route === undefined || request_method === undefined){
    data_storage.delete_all_routes()
    .then(function(data){
      res.send("deleted routes")
    })
    .catch(function(error){
      res.status(400).send("Error occured ", error)
    })
  } else {
    request_method = request_method.toUpperCase()
    data_storage.delete_route(request_method, route)
    .then(function(data){
      res.send("deleted route" + route + " for " + request_method)
    })
    .catch(function(error){
      res.status(400).send("Error occured ", error)
    })
  }
});

app.all('/get_last_request', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method').toUpperCase()
  
  if(route === undefined || request_method === undefined){
    res.set({'Content-Type': 'text/plain'})
    res.status(400).send('You forgot to define method or routing.');
  } else {
    request_method = request_method.toUpperCase()
    data_storage.find_last_request_for_route(request_method, route)    
    .then(function(data){
      res.status(200).send(data)
    })
    .catch(function(error){
      res.set({'Content-Type': 'text/plain'})
      console.log("Request history not found for specified route" + route + " and method " + request_method)
      res.set({'Content-Type': 'text/plain'})
      res.status(400).send('No entry for ' + req.method + ' ' + req.url + ' yet.');
      console.log(error)
    })
  }
});

app.all('/get_request_history', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method').toUpperCase()
  
  if(route === undefined || request_method === undefined){
    res.set({'Content-Type': 'text/plain'})
    res.status(400).send('You forgot to define method or routing.');
  } else {
    request_method = request_method.toUpperCase()
    data_storage.find_all_requests_for_route(request_method, route)    
    .then(function(data){
      res.status(200).send(data)
    })
    .catch(function(error){
      console.log("Request history not found for specified route" + route + " and method " + request_method)
      res.set({'Content-Type': 'text/plain'})
      res.status(404).send('No entry for ' + req.method + ' ' + req.url + ' yet.');
      console.log(error)
    })
  }
});

app.all('/delete_history', function(req, res, next) {
  data_storage.delete_request_history()
  .then(function(data){
    res.status(200).send("deleted history")
  })
  .catch(function(error){
    res.status(400).send(error)
  })
});

app.all('/*', function(req, res, next){
  var route = req.path
  var request_method = req.method
  var route_response = data_storage.find_route(request_method, route)    
    .then(function(data){
      console.log(data)
      data_storage.save_last_request_for_route(data.method, data.route, req.headers, req.body)
      res.set(data.header)
      res.status(parseInt(data.response_code))      
      res.send(data.body)
    })
    .catch(function(error){
      console.log(error)
      res.set({'Content-Type': 'text/plain'})
      res.status(404).send('Cannot handle ' + req.method + ' ' + req.url);
    })
})

module.exports = app;
