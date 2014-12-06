var mongoose = require('mongoose');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var mongoosedb = mongoose.connect('mongodb://heroku_app19233564:l9gkeumrjjh260jonskj3l39kj@ds053218.mongolab.com:53218/heroku_app19233564');
var Schema = mongoose.Schema;

var tvProgramSchema = new Schema({
    title: {type: String, unique: true},
    titleimg: {type: String},
    type: String,
    channel: String,
    date: [String],
    airTime: String,
    outline: String,
    hit: {type: Number, default: 0},
    episode : [{type: Schema.Types.ObjectId, ref: 'Episode'}]
});

var episodeSchema = new Schema({
	title: String,
    epnum: Number,
    outline: String,
    img: String,
    date: String,
    data: {type: Schema.Types.ObjectId, ref: 'EpisodeData'},
    tudouId: [String],
    sohuId: String,
    dmId: [String],
    youtubeId: String,
    premiumId: String,
    hit: Number
});

var TvProgram = mongoose.model('TvProgram', tvProgramSchema);
var Episode = mongoose.model('Episode', episodeSchema);

var programUrl = "http://www.netsko.com/tv_drama"

async.waterfall([
	function (callback) {
		request(programUrl, function (err, res, body) {
			var $ = cheerio.load(body);

			var categoryList = $("select[name='category']>option");
			var cateListLen = $("select[name='category']>option");

			for (var i = 16; i < 17; i++) {
				var stitle = $(categoryList[i]).text().split("(")[0];
				var title = stitle.replace(/[^가-힣\w-,:]/g,"");
				var categoryId = $(categoryList[i]).attr("value");
				var detailUrl = "http://www.netsko.com/?mid=tv_drama&category="+categoryId;

				callback(null, title, "http://www.netsko.com/?mid=tv_drama&category="+categoryId);
			};

		});
	},
	function (title, url, callback) {
		sleep(100*0);
		request(url, function (err, res, body) {
			var $ = cheerio.load(body);
			console.log("1.Get Last Page : ",title, url);
			var lastPage = $(".pagination>a:last-Child").attr("href").split("page=")[1];
			for (var page = 8; page <= lastPage; page++) {
				callback(null, title, url, page);
			};
		});
	},
	function (title, url, page, callback) {
		console.log("2.Request Program List : ",title, url, page);
		sleep(100*0);
		request(url+"&page="+page, function (err, res, body) {
			var $ = cheerio.load(body);
			$('td.title>a:nth-child(2)').each(function (item) {
				var href = $(this).attr('href');
				var name = $(this).text();
				var epnum = name.match(/\b\d+회/g);
				var date = name.match(/\b\d+월\d+일/g);
                var sname = name.split(" ");
				var version = sname[sname.length-1];
				if (!epnum) { return; };
				callback(null, title, url+href, epnum, date, version);
			});
		});
	},
	function (title, url, epnum, date, version, callback) {
		console.log("3.Request Detail Information : ",title,url,epnum,date,version);
		sleep(100*0);

		request(url, function (err, res, body) {
			var $ = cheerio.load(body);
			if (version=="토도우") {
				var a = $('.xe_content a');
				for (var i = 0; i < a.length-1; i++) {
					var href = $(a).attr('href');
					var tudouId = href.match(/[\w-]{11}(?=\/)/g);
					callback(null, title, epnum, date, "tudou", tudouId);
				};
			} else if (version=="소후") {
				var sohuId = $('.xe_content a').attr('href').match(/[\d]{8}/g);
				callback(null, title, epnum, date, "sohu", sohuId);
			} else if (version=="유튜브") {
				var youtubeId = $('.xe_content a').attr('href').replace(/^.*\//,"");
				callback(null, title, epnum, date, "youtube", youtubeId);
			} else if (version.indexOf("DM")!=-1) {
				var a = $('.xe_content a');
				for (var i = 0; i < a.length-1; i++) {
					if ($(a[i]).attr('href').indexOf("/video") != -1) {
						var href = $(a[i]).attr('href');
						var dmId = href.split("/video")[1].match(/(\w{19}|x[A-Za-z0-9]{5,7})/g);
						callback(null, title, epnum, date, "dm", dmId);
					} else if ($(a[i]).attr('href').indexOf("dai.ly/") != -1) {
						var href = $(a[i]).attr('href');
						var dmId = href.split("dai.ly/")[1].match(/(\w{19}|x[A-Za-z0-9]{5,7})/g);
						callback(null, title, epnum, date, "dm", dmId);
					};
				};
			};
		});
	},
	function (title, epnum, date, version, id, callback) {
		console.log("4.Get Thumbnail Image : ",title,epnum,date,version);
		if (version=="tudou") {
			request("http://api.tudou.com/v3/gw?method=item.info.get&appKey=myKey&format=xml&itemCodes="+id, function (err, res, body) {
				var $ = cheerio.load(body);
				// 이미지가 있을때만 콜백
				var img = $("bigPicUrl").text();
				if (img) {
					callback(null, title, epnum, date, version, id, img);
				};
			});
		} else if (version=="dm") {
			request("https://api.dailymotion.com/video/"+id+"?fields=thumbnail_url", function (err, res, data) {
				// 이미지가 있을때만 콜백 
				var img = JSON.parse(data).thumbnail_url;
				if (img) {
					callback(null, title, epnum, date, version, id, img);
				};
			});
		} else {
			callback(null, title, epnum, date, version, id, null);
		};
	}],
	function (err, title, epnum, date, version, id, img) {
		if (err) {throw err};
		console.log("5.Save Database : ", title, epnum, version, id, img);
		// var outline = epnum;
		// var epnum = parseInt(epnum);

		sleep(100*1);
		Episode.findOneAndUpdate({title: title, epnum: parseInt(epnum)}, {$set: {title: title, epnum: parseInt(epnum), date: date, outline: epnum}}, {upsert:true}, function (err, episode) {
			if (err) { throw err; } else {
				TvProgram.update({title: title}, {$set: {title: title, type: '드라마', hit:0}, $addToSet: {episode: episode._id}}, {upsert:true}, function (err) {
					if (err) { throw err; } else{
						if (version=="tudou") {
							episode.tudouId.addToSet(id);
							if (!episode.img || episode.img.indexOf("dmcdn.net")!=-1) {
								episode.img = img;
							};
						} else if (version=="sohu") {
							episode.sohuId = id;
						} else if (version=="youtube") {
							episode.youtubeId = id;
						} else {
							episode.dmId.addToSet(id);
							if (!episode.img) {
								episode.img = img;
							};
						};
						episode.save(function (err) { if (err) { throw err; } });
						console.log("6.Save Complete : ", title, epnum, version, id);
					};
				});
			};
		});
});

function sleep (milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
};
