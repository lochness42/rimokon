var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var routingObject = {}
var requestObject = {}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
 
  routingObject[request_method + '||' + route] = {
    'header' : req.headers,
    'body' : req.body,
    'response_code': response_code
  }
  console.log('Routing object: ')
  console.log(routingObject)
  res.send("New route" + route + " for " + request_method  + " with response code " + response_code)
});

app.all('/delete_routes', function(req, res, next) {
  var route = req.get('route')
  var request_method = req.get('method')
  res.statusCode = 200

  if(route === undefined || request_method === undefined){
    res.send("deleted all routes")
    routingObject = {}
  } else {
    request_method = request_method.toUpperCase()
    delete routingObject[request_method + '||' + route]
    res.send("deleted route" + route + " for " + request_method)
  }
  console.log(routingObject)
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
      var routing_key = request_method + '||' + route
      if (requestObject.hasOwnProperty(routing_key)) {
      res.statusCode = 200;
      res.header = {'Content-Type': 'application/json'}
      res.send(requestObject[routing_key]);  
    } else {
      console.log(routing_key)
      console.log(request_method[routing_key])
      res.statusCode = 400;
      res.header = {'Content-Type': 'text/plain'}
      res.send('No entry for ' + req.method + ' ' + req.url + ' yet.');
    }
  }
});

app.all('/*', function(req, res, next){
  var route = req.path
  var request_method = req.method
  var routing_key = request_method + '||' + route
  if (routingObject.hasOwnProperty(routing_key)){
    response_object = routingObject[routing_key]
    res.statusCode = response_object['response_code'];
    res.header = response_object['header']
    res.send(response_object['body']);
    requestObject[routing_key] = {
      'header' : req.headers,
      'body' : req.body,
    }
    console.log('Request object: ') 
    console.log(requestObject)
  } else {
    res.statusCode = 400;
    res.header = {'Content-Type': 'text/plain'}
    res.send('Cannot ' + req.method + ' ' + req.url);
  }
  next()
})

module.exports = app;
