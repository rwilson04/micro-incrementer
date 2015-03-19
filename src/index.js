var express = require('express');
var app = express();

var server = app.listen(80, function() {
	console.log("Incrementer server started on port 80");
});
