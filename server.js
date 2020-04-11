// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var fs 		   = require("fs");
var bodyParser = require("body-parser");

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
			workout : String,
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
	General: [ 
		{workout: String, username : String, amount : Int},
	],

	Workouts: [ 
		{workout: String, data: [
			{
				{username: String, amount: Int},
			}]},
	]
}

*/
router.route('/leaderboard')
	.get(function(req, res) {
		fs.access("leaderboard.txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				res.json(throwError());
  				return;
  			} 

  			fs.readFile("leaderboard.txt", "utf-8", (err, data) => {
				if(err) {
					res.json(throwError());
					return;
				} 

				var board = JSON.parse(data);
				res.json(board);
  			});
  		});
	});

router.route('/new/:username')
	.get(function(req, res){
		fs.access(req.params.username + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				console.log("Creating file for " + req.params.username);
  				toWrite = {Stats: [], Challenges: []};
	  			fs.writeFile(req.params.username + ".txt", JSON.stringify(toWrite), (err) => {
					if(err) {
						res.json(throwError());
						return;
					}
				});
				res.json({message: "Successfully created a new user!", err: null})
  				return;
  			} 
  			res.json({message: "", err: "User Already Exists"});
  		});
	});

router.route('/update/:username/:workout/:amount')
	.get(function(req, res) {
		fs.access(req.params.username + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				console.log(req.params.username + " data not found");
  				res.json(throwError());
  				return;
  			} 

  			fs.readFile(req.params.username + ".txt", "utf-8", (err, data) => {
				if(err) {
					res.json(throwError());
					return;
				} 

				var userData = JSON.parse(data);
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

				fs.readFile("leaderboard.txt", "utf-8", (err, data) => {
					if(err) {
						res.json(throwError());
						return;
					} 

					var leaderboard = JSON.parse(data);
		  			var changed = false;
		  			for(let i = 0; i < leaderboard.General.length; i++) {
		  				if(leaderboard.General[i].workout.localeCompare(req.params.workout) == 0) {
		  					found = true;
		  					if(leaderboard.General[i].amount < newAmount) {
		  						changed = true;
		  						leaderboard.General[i].amount = newAmount;
		  						leaderboard.General[i].username = req.params.username;
		  					}
		  					break;
		  				}
		  			}

		  			if(!found) {
		  				changed = true;
		  				leaderboard.General.push({workout: req.params.workout, username : req.params.username, amount : newAmount});
		  			}

		  			var workOutfound = false;
		  			var inserted = false;
		  			for(let i = 0; i < leaderboard.Workouts.length; i++) {
		  				if(leaderboard.Workouts[i].workout.localeCompare(req.params.workout) == 0) {

		  					workOutfound = true;
		  					for(let k = 0; k < leaderboard.Workouts[i].Data.length; k++) {

		  						if(leaderboard.Workouts[i].Data[k].amount < newAmount) {
		  							inserted = true
		  							leaderboard.Workouts[i].Data.splice(k, 0, {username: req.params.username, amount: newAmount});
		  							for(let j = k + 1; j < leaderboard.Workouts[i].Data.length; j++) {
		  								if(leaderboard.Workouts[i].Data[j].username.localeCompare(req.params.username) == 0) {
		  									leaderboard.Workouts[i].Data.splice(j, 1);
		  									break;
		  								}
		  							}
		  							break;
		  						} else {
		  							if(leaderboard.Workouts[i].Data[k].username.localeCompare(req.params.username) == 0) {
		  								inserted = true
		  								leaderboard.Workouts[i].Data[k].amount = newAmount;
		  								break;
		  							}
		  						}
		  					}
		  					if(!inserted) {
		  						leaderboard.Workouts[i].Data.push({username: req.params.username, amount: newAmount});
		  					}
		  				}
		  				if(workOutfound) {
		  					break;
		  				}
		  			}

		  			if(!workOutfound) {
		  				leaderboard.Workouts.push({workout: req.params.workout, Data: [{username: req.params.username, amount: newAmount}]});
		  			}

	  				fs.writeFile("leaderboard.txt", JSON.stringify(leaderboard), (err) => {
						if(err) {
							res.json(throwError());
							return;
						}
					});

		  			fs.writeFile(req.params.username + ".txt", JSON.stringify(userData), (err) =>{
						if(err) {
							res.json(throwError());
							return;
						}
					});

		  			if(changed) {
		  				res.json({message: "Congrats! You topped the leaderboard!", err: null});
		  			} else {
						res.json({message: "Updated Successfully", err: null});
		  			}
				});
			});
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

  			fs.readFile(req.params.username + ".txt", "utf-8", (err, data) => {
				if(err) {
					res.json(throwError());
					return;
				} 

				var userData = JSON.parse(data);
				res.json(userData);
  			});
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

  				fs.readFile(req.params.challenger + ".txt", "utf-8", (err, data) => {
					if(err) {
						res.json(throwError());
						return;
					}

					var challengerData = JSON.parse(data);
	  				
	  				fs.readFile(req.params.challenged + ".txt", "utf-8", (err, data) => {
						if(err) {
							res.json(throwError());
							return;
						} 

						var challengedData = JSON.parse(data);

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
		});
	});

function throwError() {
	return {message: "", err: "An error occured"};
}


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
fs.access("leaderboard.txt", fs.constants.F_OK, (err) => {
	if (err) {
		console.log("Creating a new leaderboard");
		toWrite = {General: [], Workouts: []};
		fs.writeFile("leaderboard.txt", JSON.stringify(toWrite), (err) => {
			if(err) {
				return;
			}
		});
	}
});
console.log('Magic happens on port ' + port);