// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var request    = require('request');
var cheerio    = require('cheerio');
var _          = require('underscore');
var unirest    = require("unirest");
var fs 		   = require("fs")

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8081;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to the Duke Fitness API!\nUseage:'
     + '\n/ping'
     + '\n/create/username'
     + '\n/challenge/challenger/challenged/workout/amount'
     + '\n/stats/get/username'
     + '\n/stats/update/username/workout/amount'
 	 + '\n/leaderboard/get/workout'});   
});

// more routes for our API will happen here

router.get('/ping', function(req, res) {
	res.json({message: 'Online and Ready', err:null});
});


/*
username.txt will be set up as follows
{
	Stats : { 	Meant to be growable
		workout : amount
	}
	Challenges : [ {
			opponent : String,
			workout : String,
			amount : String,
		}
	]
}

*/

router.route('/challenge/:challenger/:challenged/:workout/:amount')
	.get(function(req,res) {
		var done = false;
		fs.access(req.params.challenger + ".txt", fs.constants.F_OK, (err) => {
  			done = true
		});
		fs.access(req.params.challenged + ".txt", fs.constants.F_OK, (err) => {
  			done = true
		});
		fs.readFile(req.params.challenger + ".txt", "utf-8", (err, data) => {
			if(err) {
				res.json({message: "", err:"An Error Occured"});
				done = true;
			} else {
				var challengerData = JSON.parse(data);
			}
		})

		fs.readFile(req.params.challenged + ".txt", "utf-8", (err, data) => {
			if(err) {
				res.json({message: "", err:"An Error Occured"});
				done = true;
			} else {
				var challengedData = JSON.parse(data);
			}
		})

		if(!done) {
			challengerData.Challenges.push({opponent: req.params.challenged, 
											workout: req.params.workout,
											amount: req.params.amount});
			challengedData.Challenges.push({opponent: req.params.challenger, 
											workout: req.params.workout,
											amount: req.params.amount});
			fs.writeFile(req.params.challenger + ".txt", JSON.stringify(challengerData), (err) =>{
				if(err) throw err;
			});
			fs.writeFile(req.params.challenged + ".txt", JSON.stringify(challengedData), (err) =>{
				if(err) throw err;
			});

			res.json({message: "Challenge sent", err:null});
		}
	});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
