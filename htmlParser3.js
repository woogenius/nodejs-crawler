var mongoose = require('mongoose');
var cheerio = require('cheerio');
var request = require('request');

// request("http://api.tudou.com/v3/gw?method=item.info.get&appKey=40146f63d8b1c090&format=xml&itemCodes=NexcCElMJHE", function (err, res, body) {
// 	var $ = cheerio.load(body);

// 	console.log($('bigPicUrl').text());
				
// });

request( "https://api.dailymotion.com/video/x17y5pr?fields=thumbnail_url", function ( err,res,body ) {
	var JSONdata = [];
	JSONdata = JSON.parse([body]);
	console.log(JSONdata);

});