var express = require('express');
var redis = require("redis");
var request = require("request");
var port = 80;

var app = express();
var client = redis.createClient(6379, 'incrementer-redis');
var defaultKey = "default-key";

client.on('connect', function() {
	console.log("===Incrementer===> Connected to redis");
});

client.on('error', function(err) {
	console.log("===Incrementer===> Redis error", err);
});

app.use(function(req, res, next) {
	var date = new Date();
	console.log("===Incrementer===> Got " + req.method + " request to " + req.originalUrl + " at " + date.toDateString() + " " + date.toTimeString());
	next();
});

app.get("/", function(req, res, next) {
	client.incr(defaultKey, function(err, reply) {
		if (err) throw(err);
		console.log("===Incrementer===> " + defaultKey + ":" + reply);
		backup();
		res.json(reply);
	});
});

function backup() {
	if (process.env.AUTOBACKUP.toLowerCase() === "true") {
		console.log("===Incrementer===> Backing up");
		request("http://persistence/data", function(err, res, body) {
			if (err) {
				console.log("===Incrementer===> Error:", err);
			}
			console.log("===Incrementer===> Backed up:", body);
		});
	} else {
		console.log("===Incrementer===> Not backing up");
		console.log("===Incrementer===> AUTOBACKUP", process.env.AUTOBACKUP);
		console.log("===Incrementer===> AUTOBACKUP type", typeof process.env.AUTOBACKUP);
	}
}

app.get("/:namespace", function(req, res, next) {
	var namespace = req.params.namespace;
	client.incr(namespace, function(err, reply) {
		if (err) throw(err);
		console.log("===Incrementer===> " + namespace + ":" + reply);
		backup();
		res.json(reply);
	});
});

app.post("/:number", function(req, res, next) {
	var number = parseInt(req.params.number);
	if (isNaN(number)) {
		res.status(422);
		res.json({error: "Single URL parameter in POST request must be numeric"});
		return;
	}
	client.incrby(defaultKey, number, function(err, reply) {
		if (err) throw(err);
		console.log("===Incrementer===> " + reply);
		backup();
		res.json(reply);
	});
});

app.post("/:namespace/:number", function(req, res, next) {
	var namespace = req.params.namespace;
	var number = req.params.number;
	if (isNaN(number)) {
		res.status(422);
		res.json({error: "Second URL parameter in POST request must be numeric"});
		return;
	}
	client.incrby(namespace, number, function(err, reply) {
		if (err) throw(err);
		console.log("===Incrementer===> " + reply);
		backup();
		res.json(reply);
	});
});

app.put("/:number", function(req, res, next) {
	var number = req.params.number;
	if (isNaN(number)) {
		res.status(422);
		res.json({error: "Single URL parameter in PUT request must be numeric"});
		return;
	}
	client.set(defaultKey, number, function(err, reply) {
		if (err) throw(err);
		console.log("===Incrementer===> " + reply);
		if (reply === "OK") {
			backup();
			res.json({success: true});
		} else {
			res.status(500);
			res.json({error: "Something went wrong"});
		}
	});
});

app.put("/:namespace/:number", function(req, res, next) {
	var namespace = req.params.namespace;
	var number = req.params.number;
	if (isNaN(number)) {
		res.status(422);
		res.json({error: "Second URL parameter in PUT request must be numeric"});
		return;
	}
	client.set(namespace, number, function(err, reply) {
		if (err) throw(err);
		console.log("===Incrementer===> " + reply);
		if (reply === "OK") {
			backup();
			res.json({success: true});
		} else {
			res.status(500);
			res.json({error: "Something went wrong"});
		}
	});
});

var server = app.listen(port, function() {
	console.log("Incrementer server started on port " + port);
});
