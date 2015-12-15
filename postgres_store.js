var PostgresStore = function() {
  var pg = require('pg');
  pg.on('error', function (err) {
    console.log('Database error!', err);
  });
  var pgp = require('pg-promise')();
  var cn = {
    host: 'hostURL',
    port: 5432,
    database: 'databaseName',
    user: 'username',
    password: 'password',
    ssl: true
  };
  var db = pgp(cn);

  this.init = function(){
    create_routing_table()
    .then(function(){
      create_history_table();
    })
  }

  this.add_route = function(method, route, response_code, header, body) {
    db.query('delete from routes where route=$1 and method=$2', [route, method])
    .then(function(data){
      console.log("Deleted", data)
    }).catch(function(error){
      console.log("We're good to go", error)
    })

    return db.none("insert into routes(route, method, response_code, header, body) values($1, $2, $3, $4, $5)", [route, method, response_code, header, body])
  }

  this.find_route = function(method, route) {
    return db.one("select * from routes where route=$1 and method=$2 order by id desc limit 1", [route, method])
  }

  this.delete_route = function(method, route) {
    return db.query('delete from routes where route=$1 and method=$2', [route, method])
  }
  this.delete_all_routes = function() {
    return db.query('delete from routes')
  }

  this.save_last_request_for_route = function(method, route, header, body) {
    return db.query("insert into history(route, method, header, body) values($1, $2, $3, $4)", [route, method, header, body])
  }

  this.find_last_request_for_route = function(method, route) {
    return db.one('select * from history where method=$1 and route=$2 order by timestamp desc limit 1', [method, route])
  }

  this.find_all_requests_for_route = function(method, route) {
    return db.many('select * from history where method=$1 and route=$2', [method, route])
  }

  this.delete_request_history = function() {
    return db.query('delete from history')
  }

  create_routing_table = function(){
    return db.query('CREATE TABLE IF NOT EXISTS routes(id SERIAL PRIMARY KEY, route TEXT not null, method TEXT not null, response_code TEXT not null, header TEXT not null, body TEXT not null)')
  }

  create_history_table = function(){
    return db.query('CREATE TABLE IF NOT EXISTS history(id SERIAL PRIMARY KEY, route TEXT not null, method TEXT not null, header TEXT not null, body TEXT not null, timestamp timestamptz NOT NULL DEFAULT now())');
  }

  drop_routing_table = function(){
    return db.query('DROP TABLE IF EXISTS routes;')
  }

  drop_history_table = function(){
    return db.query('DROP TABLE IF EXISTS history;')
  }

};

module.exports = new PostgresStore();
