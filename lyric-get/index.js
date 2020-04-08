var request    = require('request');
var cheerio    = require('cheerio');
var _          = require('underscore');
var unirest    = require("unirest");


module.exports = {
	get: function(artist, song, res) {
		var lyrics = "";
		const url = 'https://genius.com/' + artist + '-' + song + "-lyrics";
		console.log(url);
		request(url, function(error, response, html) {
	        if(error)
	        {
	       		res = {lyric:"", err:error};
	        }
	        else
	        {
		        var $ = cheerio.load(html, {decodeEntities: false});
		        console.log($(".lyrics").html());
		        $('script').remove();
		        var lyrics = ($(".lyrics").html());
				/**
				 * Override default underscore escape map
				 */
				 if(lyrics == null)
				 	lyrics = "";
				// replace html codes with punctuation
				console.log("Lyrics are" + lyrics);
				// remove everything between brackets
				lyrics = lyrics.replace(/&#x2019;/, "'");
				lyrics = lyrics.replace(/\[[^\]]*\]/g, '');
				// remove html comments
				lyrics = lyrics.replace(/(<!--)[^-]*-->/g, '');
				// replace newlines
				lyrics = lyrics.replace(/<br>/g, '\n');
				// remove all tags
				lyrics = lyrics.replace(/<[^>]*>/g, '');

		        if(lyrics != ""){
		        	res = {lyric:lyrics, err:"none"};
		        }
		        else{
		        	var again = unirest("GET", "https://genius.p.rapidapi.com/search");

					again.query({"q": song.split("-")[0] + " " + artist.replace("-", " ")});

					again.headers({
						"x-rapidapi-host": "genius.p.rapidapi.com",
						"x-rapidapi-key": "b2ee8ca4famsh45feaf5d47e60a4p11cb90jsn202ae8221c1e"
					});

					again.end(function (res2) {
						if (error) {
							res = {lyric:"", err:error};
						}
						else 
						{

							let path = res2.body["response"]["hits"][0]["result"]["path"];

							const url2 = 'https://genius.com' + path;
		
							request(url2, function(error, response, html) {
						        if(error)
						        {
						       		res = {lyric:"", err:error};
						        }
						        else
						        {
							        var $ = cheerio.load(html);
							        $('script').remove();
							        var lyrics = ($(".lyrics").html());
									/**
									 * Override default underscore escape map
									 */
									var escapeMap = {
										  '&': '&amp;',
										  '<': '&lt;',
										  '>': '&gt;',
										  '"': '&quot;',
										  "'": '&#x27;',
										  "'": '&#x2019;',
										  "'": '&apos;',
										  '`': '&#x60;',
										  "-": '&#x2014;',
										  '' : '\n',
										  "-" : '&#x2013;',
										  ' ': '&#x2005;'
										};
									var unescapeMap = _.invert(escapeMap);
									var createEscaper = function(map) {
									  var escaper = function(match) {
									    return map[match];
									  };

									  var source = '(?:' + _.keys(map).join('|') + ')';
									  var testRegexp = RegExp(source);
									  var replaceRegexp = RegExp(source, 'g');
									  return function(string) {
									    string = string == null ? '' : '' + string;
									    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
									  };
									};
									_.escape = createEscaper(escapeMap);
									_.unescape = createEscaper(unescapeMap);
									// replace html codes with punctuation
									lyrics = _.unescape(lyrics);				
									lyrics = lyrics.replace(/&#x2019;/, "'");
									// remove everything between brackets
									lyrics = lyrics.replace(/\[[^\]]*\]/g, '');
									// remove html comments
									lyrics = lyrics.replace(/(<!--)[^-]*-->/g, '');
									// replace newlines
									lyrics = lyrics.replace(/<br>/g, '\n');
									// remove all tags
									lyrics = lyrics.replace(/<[^>]*>/g, '');
									lyrics = lyrics.replace("&#x2019;", "'");
							        if(lyrics != ""){
							        	res = {lyric:lyrics, err:"none"};
							        } else {
							        	res = {lyric:"", err: "not found"};
							        }
							    }
							});
						}
					});
		        }
		    }
		});
	}
}