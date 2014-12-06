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

var programUrl = "http://www.netsko.com/tv_culture"

async.waterfall([
	function (callback) {
		request(programUrl, function (err, res, body) {
			var $ = cheerio.load(body);

			var categoryList = $("select[name='category']>option");
			var cateListLen = $("select[name='category']>option").length;

			for (var i = 18; i < 19; i++) {
				var stitle = $(categoryList[i]).text().split("(");
				var title = stitle[0].replace(/[^가-힣\w-,&美人:]/g,"");
				var categoryId = $(categoryList[i]).attr("value");
				var detailUrl = "http://www.netsko.com/?mid=tv_entertainment&category="+categoryId;
				callback(null, title, detailUrl);
			};

		});
	},
	function (title, url, callback) {
		// sleep(1000*1);
		request(url, function (err, res, body) {
			var $ = cheerio.load(body);
			console.log("1.Get Last Page : ",title, url);
			var lastPage = $(".pagination>a:last-Child").attr("href").split("page=")[1];
			for (var page = 1; page <= lastPage; page++) {
				callback(null, title, url, page);
			};
		});
	},
	function (title, url, page, callback) {
		console.log("2.Request Program List : ",title, url, page);
		// sleep(1000*1);
		request(url+"&page="+page, function (err, res, body) {
			var $ = cheerio.load(body);
			$('td.title>a:nth-child(2)').each(function (item) {
				var href = $(this).attr('href');
				var name = $(this).text();
				var version = name.split(" ")[name.split(" ").length-1];
				name = name.slice(0, name.lastIndexOf(" "));
				var title = name.replace(/\b\d+회|\b\d+월\d+일|<[^>]+>/g,"");
				var outline = name.match(/<[^>]+>/g);
				var epnum = parseInt(name.match(/\b\d+회/g));
				var date = name.match(/\b\d+월\d+일/g);
				if (!epnum) { epnum = parseInt(date); };
				if (!outline) { outline = epnum+"회" };

				callback(null, title.replace(/[^가-힣\w-,&美人':]/g,""), url+href, epnum, date, version, outline);
			});
		});
	},
	function (title, url, epnum, date, version, outline, callback) {
		console.log("3.Request Detail Information : ",title,url,epnum,date,version);
		// sleep(1000*1);

		request(url, function (err, res, body) {
			var $ = cheerio.load(body);
			if (version=="토도우") {
				var a = $('.xe_content a');
				for (var i = 0; i < a.length-1; i++) {
					var href = $(a[i]).attr('href');
					var tudouId = href.split("view/")[1].match(/[\w-]{11}(?=\/)/g);
					callback(null, title, epnum, date, "tudou", tudouId, outline);
				};
			} else if (version=="소후") {
				if (!$('.xe_content a').attr('href')) { return; };
				var sohuId = $('.xe_content a').attr('href').match(/[\d]{8}/g);
				callback(null, title, epnum, date, "sohu", sohuId, outline);
			} else if (version=="유튜브") {
				if (!$('.xe_content a').attr('href')) { return; };
				var youtubeId = $('.xe_content a').attr('href').replace(/^.*\//,"");
				callback(null, title, epnum, date, "youtube", youtubeId, outline);
			} else if (version.indexOf("DM")!=-1) {
				var a = $('.xe_content a');
				for (var i = 0; i < a.length-1; i++) {
					if ($(a[i]).attr('href').indexOf("/video") != -1) {
						var href = $(a[i]).attr('href');
						var dmId = href.split("/video")[1].match(/(\w{19}|x[A-Za-z0-9]{5,7})/g);
						callback(null, title, epnum, date, "dm", dmId, outline);
					} else if ($(a[i]).attr('href').indexOf("dai.ly/") != -1) {
						var href = $(a[i]).attr('href');
						var dmId = href.split("dai.ly/")[1].match(/(\w{19}|x[A-Za-z0-9]{5,7})/g);
						callback(null, title, epnum, date, "dm", dmId, outline);
					};
				};
			};
		});
	},
	function (title, epnum, date, version, id, outline, callback) {
		console.log("4.Get Thumbnail Image : ",title,epnum,date,version,outline);
		if (version=="tudou") {
			sleep(1000*1);
			// request("http://api.tudou.com/v3/gw?method=item.info.get&appKey=myKey&format=json&itemCodes="+id, function (err, res, body) {
			request("http://api.tudou.com/v3/gw?method=item.info.get&appKey=40146f63d8b1c090&format=xml&itemCodes="+id, function (err, res, data) {
				// 이미지가 있을때만 콜백
				var $ = cheerio.load(data);
				var img = $('bigPicUrl').text();
				if(img) {
					callback(null, title, epnum, date, version, id, img, outline);
				};
			});
		} else if (version=="dm") {
			sleep(500*1);
			request("https://api.dailymotion.com/video/"+id+"?fields=thumbnail_url", function (err, res, data) {
				// 이미지가 있을때만 콜백 
				var JSONdata = JSON.parse([data]);
				if (!!JSONdata.thumbnail_url) {
					var img = JSONdata.thumbnail_url;
					callback(null, title, epnum, date, version, id, img, outline);
				};
			});
		} else {
			callback(null, title, epnum, date, version, id, null, outline);
		};
	}],
	function (err, title, epnum, date, version, id, img, outline) {
		if (err) {throw err};
		console.log("5.Save Database : ", title, epnum, version, id, img);
		// sleep(1000*1);

		Episode.findOneAndUpdate({title: title, epnum: epnum}, {$set: {title: title, epnum: epnum, date: date, outline: outline}}, {upsert:true}, function (err, episode) {
			if (err) { throw err; } else {
				TvProgram.update({title: title}, {$set: {title: title, type: '기타', hit:0}, $addToSet: {episode: episode._id}}, {upsert:true}, function (err) {
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
