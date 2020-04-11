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
     + '\n/new/username'
     + '\n/challenge/challenger/challenged/workout/amount'
     + '\n/stats/username'
     + '\n/update/username/workout/amount'
 	 + '\n/leaderboard'});   
});

// more routes for our API will happen here

router.get('/ping', function(req, res) {
	res.json({message: 'Online and Ready', err:null});
});


/*
username.txt will be set up as follows
{
	Stats : [ { 
			name : String,
			amount : Int
		}
	], 
	Challenges : [ {
			opponent : String,
			workout : String,
			amount : Int,
		}
	]
}

leaderboard.txt will be set up as
{
	Data: [ 
		{workout: String, username : String, amount : Int},
	]
}

*/

router.route('/update/:username/:workout/:amount')
	.get(function(req, res) {
		fs.access(req.params.username + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				console.log(req.params.username + " data not found");
  				res.json(throwError());
  				return;
  			} 
  			var userData = readFile(req.params.username + ".txt");
  			var found = false;
  			var newAmount = parseInt(req.params.amount);
  			for(let i = 0; i < userData.Stats.length; i++) {
  				if(userData.Stats[i].workout.localeCompare(req.params.workout) == 0) {
  					userData.Stats[i].amount = userData.Stats[i].amount + parseInt(req.params.amount);
  					newAmount = userData.Stats[i].amount
  					found = true;
  					break;
  				}
  			}
  			
  			if(!found) {
  				userData.Stats.push({workout: req.params.workout, amount: parseInt(req.params.amount)});
  			}

  			var leaderboard = readFile("leaderboard.txt");

  			var changed = false;
  			for(let i = 0; i < leaderboard.Data.length; i++) {
  				if(leaderboard.Data[i].workout.localeCompare(req.params.workout) == 0) {
  					found = true;
  					if(leaderboard.Data[i].amount < newAmount) {
  						changed = true;
  						leaderboard.Data[i].amount = newAmount;
  						leaderboard.Data[i].username = req.params.username;
  					}
  					break;
  				}
  			}

  			if(!found) {
  				changed = true;
  				leaderboard.Data.push({workout: reqs.params.workout, username : reqs.params.username, amount : newAmount});
  			}

  			if(changed) {
  				fs.writeFile("leaderboard.txt", JSON.stringify(leaderboard), (err) => {
					if(err) {
						res.json(throwError());
						return;
					}
				});
  			}

  			fs.writeFile(req.params.username + ".txt", JSON.stringify(userData), (err) =>{
				if(err) {
					res.json(throwError());
					return;
				}
			});

  			if(changed) {
  				res.json{message: "Congrats! You topped the leaderboard!", err: null};
  			} else {
				res.json{message: "Updated Successfully", err: null};
  			}
  		});
	});

router.route('/stats/:username')
	.get(function(req, res) {
		fs.access(req.params.username + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				console.log(req.params.username + " data not found");
  				res.json(throwError());
  				return;
  			} 
  			var userData = readFile(req.params.username + ".txt");
  			res.json(userData);
  		});
	});

router.route('/challenge/:challenger/:challenged/:workout/:amount')
	.get(function(req,res) {
		fs.access(req.params.challenger + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				console.log(req.params.challenger + " data not found");
  				res.json(throwError());
  				return;
  			} 

  			fs.access(req.params.challenged + ".txt", fs.constants.F_OK, (err) => {
  				if (err) {
  					console.log(req.params.challenged + " data not found");
  					res.json(throwError());
  					return;
  				} 
  				var challengerData = readFile(req.params.challenger + ".txt");
  				var challengedData = readFile(req.params.challenged + ".txt");
				challengerData.Challenges.push({opponent: req.params.challenged, 
												workout: req.params.workout,
												amount: req.params.amount});
				challengedData.Challenges.push({opponent: req.params.challenger, 
												workout: req.params.workout,
												amount: req.params.amount});
				fs.writeFile(req.params.challenger + ".txt", JSON.stringify(challengerData), (err) =>{
					if(err) {
						res.json(throwError());
						return;
					}
				});
				fs.writeFile(req.params.challenged + ".txt", JSON.stringify(challengedData), (err) =>{
					if(err) {
						res.json(throwError());
						return;
					}				
				});
				res.json({message: "Challenge sent", err:null});
			});
		});
	});

function throwError() {
	return {message: "", error: "An error occured"};
}

function readFile(file) {
	fs.readFile(file, "utf-8", (err, data) => {
			if(err) {
				return null;
			} else {
				return JSON.parse(data);
			}
	})
}

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
