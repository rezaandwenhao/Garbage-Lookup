var express = require('express');
var app = express();

var port = process.env.PORT || 8080

app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/public'));

// routes

app.get("/", function(req, res) {
    res.render("index");
})

app.listen(port, console.log('app running'));