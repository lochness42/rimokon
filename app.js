var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Define store object
var data_storage = require('./memory_store.js')
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

  res.statusCode = 200

  if(route === undefined){
    this_response += 'Route is not defined\n'
    res.statusCode = 500 
  } else {
    delete response_header['route']
  }
  if(response_code === undefined){
    this_response += 'Response code is not defined\n'
    res.statusCode = 500 
  } else {
    delete response_header['response_code']
  }
  if(request_method === undefined){
    this_response += 'Method is not defined\n'
    res.statusCode = 500 
  } else {
    request_method = request_method.toUpperCase()
    delete response_header['request_method']
  }
  
  data_storage.add_route(request_method, route, response_code, response_header, req.body)
  res.send("New route" + route + " for " + request_method  + " with response code " + response_code)
});

app.all('/delete_routes', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method')
  res.statusCode = 200

  if(route === undefined || request_method === undefined){
    res.send("deleted all routes")
    data_storage.delete_all_routes()
  } else {
    request_method = request_method.toUpperCase()
    data_storage.delete_route(request_method, route)
    res.send("deleted route" + route + " for " + request_method)
  }
});

app.all('/get_last_request', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method').toUpperCase()
  
  if(route === undefined || request_method === undefined){
    res.statusCode = 400;
    res.header = {'Content-Type': 'text/plain'}
    res.send('You forgot to define method or routing.');
  } else {
    request_method = request_method.toUpperCase()
    var last_request = data_storage.find_last_request_for_route(request_method, route)
    if (last_request !== undefined) {
      res.statusCode = 200;
      res.header = {'Content-Type': 'application/json'}
      res.send(last_request);  
    } else {
      console.log("Request history not found for specified route" + route + " and method " + request_method)
      res.statusCode = 400;
      res.header = {'Content-Type': 'text/plain'}
      res.send('No entry for ' + req.method + ' ' + req.url + ' yet.');
    }
  }
});

app.all('/*', function(req, res, next){
  var route = req.path
  var request_method = req.method
  var route_response = data_storage.find_route(request_method, route)
  if (route_response == undefined){
    res.statusCode = 400;
    res.header = {'Content-Type': 'text/plain'}
    res.send('Cannot handle ' + req.method + ' ' + req.url);
  } else {
    data_storage.save_last_request_for_route(request_method, route, req.headers, req.body)
    res.statusCode = route_response['response_code']
    res.set(route_response['header'])
    res.send(route_response['body'])
    console.log('Request object: header - ' + req.headers + ' and body - ' + req.body) 
  }
  next()
})



module.exports = app;
