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
    res.json({ message: 'hooray! welcome to lyric-api!\nuse /find/artist/song' });   
});

// more routes for our API will happen here

router.get('/ping', function(req, res) {
	res.json({message: 'Online and Ready', err:null});
});

router.route('/find/:artist/:song')

	.get(function(req,res) {
		var lyrics = "";
		const url = 'https://genius.com/' + req.params.artist + '-' + req.params.song + "-lyrics";
	
		request(url, function(error, response, html) {
	        if(error)
	        {
	       		res.json({lyric:"", err:error});
	        }
	        else
	        {
		        
		        var $ = cheerio.load(html, {decodeEntities: false});
		        $('script').remove();
		        var lyrics = ($(".lyrics").html());
				/**
				 * Override default underscore escape map
				 */
				// var escapeMap = {
				//   '&': '&amp;',
				//   '<': '&lt;',
				//   '>': '&gt;',
				//   '"': '&quot;',
				//   "'": '&#x27;',
				//   "'": '&#x2019;',
				//   "'": '&apos;',
				//   '`': '&#x60;',
				//   "-": '&#x2014;',
				//   '' : '\n',
				//   "-" : '&#x2013;',
				//   ' ': '&#x2005;'
				// };
				// var unescapeMap = _.invert(escapeMap);
				// var createEscaper = function(map) {
				//   var escaper = function(match) {
				//     return map[match];
				//   };

				//   var source = '(?:' + _.keys(map).join('|') + ')';
				//   var testRegexp = RegExp(source);
				//   var replaceRegexp = RegExp(source, 'g');
				//   return function(string) {
				//     string = string == null ? '' : '' + string;
				//     return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
				//   };
				// };
				// _.escape = createEscaper(escapeMap);
				// _.unescape = createEscaper(unescapeMap);
				// // replace html codes with punctuation
				//lyrics = _.unescape(lyrics);
				// remove everything between brackets
				if(lyrics == null)
					lyrics = "";
				lyrics = lyrics.replace(/\[[^\]]*\]/g, '');
				// remove html comments
				lyrics = lyrics.replace(/(<!--)[^-]*-->/g, '');
				// replace newlines
				//lyrics = lyrics.replace(/<br>/g, '\n');
				// remove all tags
				lyrics = lyrics.replace(/<[^>]*>/g, '');
				lyrics = lyrics.replace(/[\n]{2}/g, "\n");
				lyrics = lyrics.replace(/[\n]{3, }/g, "\n\n");
				lyrics = lyrics.replace(/^[ ?\n?]+|[ ?\n?]+$/g, "");
		        if(lyrics != ""){
		        	res.json({lyric:lyrics, err:"none"});
		        }
		        else{
		        	var again = unirest("GET", "https://genius.p.rapidapi.com/search");

		        	var search = req.params.song.split("-");
		        	if(search.length > 1) {
		        		var songSearch = [search[0], search[1]].join(" ");
		        	} else {
		        		var songSearch = search[0];
		        	}
					again.query({"q": songSearch + " " + req.params.artist.replace("-", " ")});

					again.headers({
						"x-rapidapi-host": "genius.p.rapidapi.com",
						"x-rapidapi-key": "b2ee8ca4famsh45feaf5d47e60a4p11cb90jsn202ae8221c1e"
					});

					again.end(function (res2) {
						if (error) {
							res.json({lyric:"", err:error});
						}
						else 
						{
							let path = res2.body["response"]["hits"][0]["result"]["path"];

							const url2 = 'https://genius.com' + path;
		
							request(url2, function(error, response, html) {
						        if(error)
						        {
						       		res.json({lyric:"", err:error});
						        }
						        else
						        {
							        var $ = cheerio.load(html, {decodeEntities: false});
							        $('script').remove();
							        lyrics = ($(".lyrics").html());
							        if(lyrics == null)
										lyrics = "";
									/**
									 * Override default underscore escape map
									 */
									// var escapeMap = {
									// 	  '&': '&amp;',
									// 	  '<': '&lt;',
									// 	  '>': '&gt;',
									// 	  '"': '&quot;',
									// 	  "'": '&#x27;',
									// 	  "'": '&#x2019;',
									// 	  "'": '&apos;',
									// 	  '`': '&#x60;',
									// 	  "-": '&#x2014;',
									// 	  '' : '\n',
									// 	  "-" : '&#x2013;',
									// 	  ' ': '&#x2005;'
									// 	};
									// var unescapeMap = _.invert(escapeMap);
									// var createEscaper = function(map) {
									//   var escaper = function(match) {
									//     return map[match];
									//   };

									//   var source = '(?:' + _.keys(map).join('|') + ')';
									//   var testRegexp = RegExp(source);
									//   var replaceRegexp = RegExp(source, 'g');
									//   return function(string) {
									//     string = string == null ? '' : '' + string;
									//     return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
									//   };
									// };
									// _.escape = createEscaper(escapeMap);
									// _.unescape = createEscaper(unescapeMap);
									// replace html codes with punctuation
									//lyrics = _.unescape(lyrics);				
									// remove everything between brackets
									lyrics = lyrics.replace(/\[[^\]]*\]/g, '');
									// remove html comments
									lyrics = lyrics.replace(/(<!--)[^-]*-->/g, '');
									// replace newlines

									// remove all tags
									lyrics = lyrics.replace(/<[^>]*>/g, '');
									lyrics = lyrics.replace(/[\n]{2}/g, "\n");
									lyrics = lyrics.replace([/[\n]{3, }/g], "\n\n");
									lyrics = lyrics.replace(/^[ ?\n?]+|[ ?\n?]+$/g, "");
							        if(lyrics != ""){
							        	res.json({lyric:lyrics, err:"none"});
							        } else {
							        	res.json({lyric:"", err: "not found"});
							        }
							    }
							});
						}
					});
		        }
		    }
		});

	});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
