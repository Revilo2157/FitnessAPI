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
		+ '\n/leaderboard'
		+ '\n/delete/username'
	});
});
// more routes for our API will happen here

// Ping is used to test if the API is on
// =============================================================================
router.get('/ping', function(req, res) {
	console.log("Pinging");
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
			you : Int,
			them : Int,
			completed : Bool,
			first: String
		}
	]
}

leaderboard.txt will be set up as
{
	General: [{
		workout: String, 
		username : String, 
		amount : Int},
	],

	Workouts: [{
		workout: String, 
		data: [{
			username: String, 
			amount: Int
			},
		]
	]
}
*/

// Gets leaderboard 
// Inputs: None
// =============================================================================
router.route('/leaderboard')
	.get(function(req, res) {
		console.log("Getting leaderboard");
		fs.access("leaderboard.txt", fs.constants.F_OK, (err) => { // Check if the file exists
  			if (err) {
  				res.json(throwError());
  				return;
  			} 

  			fs.readFile("leaderboard.txt", "utf-8", (err, data) => { // Read the file
				if(err) {
					res.json(throwError());
					return;
				} 

				var board = JSON.parse(data);
				res.json({message: board, err: null}); // Return the file
  			});
  		});
	});

// Creates a new user
// Inputs: 
// 		username: The username to create for the user, throws an error if the username is already in use
// =============================================================================
router.route('/new/:username')
	.get(function(req, res){
		console.log("Creating new user " + req.params.username);
		fs.access(req.params.username + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
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

// Updates the amount a user has done of a workout, updates the leaderboard as well
// Inputs: 
// 		username: The user to update
// 		workout: Which workout to update
//		amount: The amount done
// =============================================================================
router.route('/update/:username/:workout/:amount')
	.get(function(req, res) {
		console.log("Updating user " + req.params.username + "'s " + req.params.workout + " by " + req.params.amount);
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
	  			var toAdd = parseInt(req.params.amount);
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
	  				userData.Stats.push({workout: req.params.workout, amount: newAmount});
	  			}

	  			// Editing the leaderboard
				// =============================================================================

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

	  				// Editing the Challenges
					// =============================================================================
					var opponents = [];
					for(let i = 0; i < userData.Challenges.length; i++) {
						found = false;
						if(userData.Challenges[i].completed)
							continue;
						if(userData.Challenges[i].workout.localeCompare(req.params.workout) == 0) {
							console.log("Updating Challenge");
							if(userData.Challenges[i].you + toAdd >= userData.Challenges[i].amount) {
								userData.Challenges[i].you = userData.Challenges[i].amount;
								if(userData.Challenges[i].them == userData.Challenges[i].amount) {
									userData.Challenges[i].completed = true;
								} else {
									userData.Challenges[i].first = req.params.username;
								}
							} else {
								userData.Challenges[i].you = userData.Challenges[i].you + toAdd;
							}

							opponent = userData.Challenges[i].opponent;
							for(let j = 0; j < opponents.length; j++) {
								if(opponents[j].localeCompare(opponent) == 0) {
									found = true;
									break;
								}
							}
							if(!found) {
								updateOpponent(opponent, req.params.username, req.params.workout, toAdd);
							}

						}
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

function updateOpponent(toUpdate, fromWho, workout, amount) {
	fs.access(toUpdate + ".txt", fs.constants.F_OK, (err) => {
		if (err) {
			console.log(toUpdate + " data not found");
			return;
		} 

		fs.readFile(toUpdate + ".txt", "utf-8", (err, data) => {
			if(err) {
				console.log("An error occurred");
				return;
			} 

			var userData = JSON.parse(data);
			// Editing the Challenges
					// =============================================================================
			for(let i = 0; i < userData.Challenges.length; i++) {
				if(userData.Challenges[i].completed)
					continue;
				if(userData.Challenges[i].workout.localeCompare(workout) == 0) {
					if(userData.Challenges[i].opponent.localeCompare(fromWho) == 0) {
						if(userData.Challenges[i].them + amount >= userData.Challenges[i].amount) {
							userData.Challenges[i].them = userData.Challenges[i].amount;
							if(userData.Challenges[i].you == userData.Challenges[i].amount) {
								userData.Challenges[i].completed = true;
							} else {
								userData.Challenges[i].first = fromWho;
							}
						} else {
							userData.Challenges[i].them = userData.Challenges[i].them + amount;
						} 
					}
				}
			}

			fs.writeFile(toUpdate + ".txt", JSON.stringify(userData), (err) => {
				if(err) {
					res.json(throwError());
					return;
				}
			});
		});
  	});
}

router.route('/delete/:username')
	.get(function(req, res) {
		console.log("Deleting user " + req.params.username);
		fs.access(req.params.username + ".txt", fs.constants.F_OK, (err) => {
  			if (err) {
  				console.log(req.params.username + " data not found");
  				res.json(throwError());
  				return;
  			} 

  			fs.unlink(req.params.username + ".txt", (err) => {
  				if(err) {
  					console.log("Failed to delete");
  					res.json(throwError());
  					return
  				}
  				res.json({message: "Successfully deleted " + req.params.username, err: null});
  			});
  		});
	});

router.route('/reset')
	.get(function(req, res) {
		console.log("Creating a new leaderboard");
		toWrite = {General: [], Workouts: []};
		fs.writeFile("leaderboard.txt", JSON.stringify(toWrite), (err) => {
			if(err) {
				res.json(throwError());
				return;
			}
			res.json({message: "Successfully reset the leaderboard!", err: null});
		});
	});

// Gets the stats for the user
// Inputs: 
// 		username: The user to retrieve the information from
// =============================================================================
router.route('/stats/:username')
	.get(function(req, res) {
		console.log("Retrieving stats for " + req.params.username);
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
				res.json({message: userData, err: null});
  			});
  		});
	});

// Updates the amount a user has done of a workout
// Inputs: 
// 		challenger: The user that initiated
// 		challenged: The user that was challenged
// 		workout: Which workout to update
//		amount: The amount done
// =============================================================================
router.route('/challenge/:challenger/:challenged/:workout/:amount')
	.get(function(req,res) {
		console.log(req.params.challenger + " is challenging " + req.params.challenged + " to do " + req.params.amount + " " + req.params.workout + "s");
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
														amount: parseInt(req.params.amount),
														you: 0,
														them: 0,
														completed: false});
						challengedData.Challenges.push({opponent: req.params.challenger, 
														workout: req.params.workout,
														amount: parseInt(req.params.amount),
														you: 0,
														them: 0,
														completed: false});
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

// Creates a leaderboard if one didnt exist
// =============================================================================
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