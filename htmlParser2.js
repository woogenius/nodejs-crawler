var mongoose = require('mongoose');
var cheerio = require('cheerio');
var request = require('request');

var mongoosedb = mongoose.connect('mongodb://heroku_app19233564:l9gkeumrjjh260jonskj3l39kj@ds053218.mongolab.com:53218/heroku_app19233564');

// var programUrl = "http://www.netsko.com/?mid=tv_drama&category=1192159&page=2"

// 토도우
var programUrl = "http://www.netsko.com/index.php?mid=tv_drama&category=1315531&search_target=title&page=4"

// 소후
// var programUrl = "http://www.netsko.com/index.php?mid=tv_drama&search_target=title&search_keyword=%EC%86%8C%ED%9B%84&page=10&division=-1640852&last_division=-1482657"

// DM
// var programUrl = "http://www.netsko.com/index.php?mid=tv_drama&search_target=title&search_keyword=DM&document_srl=1640841"

// DM2
// var programUrl = "http://www.netsko.com/?mid=tv_drama&category=1518877&search_target=title&search_keyword=DM"

// 가족의탄생
// var programUrl = "http://www.netsko.com/?mid=tv_drama&category=1155004";

// 유튜브
// var programUrl = "http://www.netsko.com/?mid=tv_drama&category=&search_target=title&search_keyword=%EC%9C%A0%ED%8A%9C%EB%B8%8C"

// var programUrl = "http://www.netsko.com/?mid=tv_drama&category=1192159&page=4"

request(programUrl, function (err, res, body) {
	var $ = cheerio.load(body);

	$('td.title>a:nth-child(2)').each(function (item) {
		var href = $(this).attr('href');
		var title = $(this).text();
		var length = title.length;
		var epnum = title.match(/\b\d+회/g);
		var date = title.match(/\b\d+월\d+일/g);
		var sTitle = title.split(" ");
		var version = sTitle[sTitle.length-1];

		// console.log(epnum);
		// console.log(href);
		// console.log(date);
		// console.log(version);

		parseIdToDataBase(title, programUrl+href, epnum, date, version);
	});

});

function parseIdToDataBase(title, url, epnum, date, version) {
	// if (!epnum) {
	// 	console.log(epnum);
	// 	return;
	// };

	console.log("line59",title,url,epnum,date,version);

	request(url, function (err, res, body) {
		var $ = cheerio.load(body);
		var href = $('.xe_content a').attr('href');
		if (version=="토도우") {
			var a = $('.xe_content a');
			for (var i = 0; i < a.length-1; i++) {
				var href = $(a[i]).attr('href');
				var tudouId = href.split("view/")[1].match(/[\w-]{11}(?=\/)/g);
				callback(null, title, epnum, date, "tudou", tudouId);
			};
		} else if (version=="소후") {
			var sohuId = href.match(/[\d]{8}/g);
			callback(null, title, epnum, date, "sohu", sohuId);
		} else if (version=="유튜브") {
			var youtubeId = href.replace(/^.*\//,"");
			callback(null, title, epnum, date, "youtube", youtubeId);
		} else if (version.indexOf("DM")!=-1) {
			var a = $('.xe_content a');
			for (var i = 0; i < a.length-1; i++) {
				var href = $(a[i]).attr('href');
				if (href.indexOf("/video") != -1) {
					var dmId = href.split("/video")[1].match(/(\w{19}|x[A-Za-z0-9]{5,7})/g);
					callback(null, title, epnum, date, "dm", dmId);
				} else if (href.indexOf("dai.ly/") != -1) {
					var dmId = href.split("dai.ly/")[1].match(/(\w{19}|x[A-Za-z0-9]{5,7})/g);
					callback(null, title, epnum, date, "dm", dmId);
				};
			};

		};
	});
};


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}