var request = require('request');
var cheerio = require('cheerio');


var headers = { 'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
'Accept-Encoding':'gzip,deflate,sdch',
'Accept-Language':'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4',
'Connection':'keep-alive',
'Cookie':'auto_l=X4H12knPaz%2BmGLpxCfKtfShUxE38rpoXvE%2BdRRbgaub1S%2Bz%2FzX9RRP3EpgQQkv3rxuMxJ53WbXpL9x9kMYfxGuh2MBjLScmz%2F4TB4mWuV5GObmYDNeFHmNoGmVC4OYe7; save_uid=woogenius%40naver.com; _ga=GA1.2.1268660849.1406206152; _dc=1; ci_session=a%3A21%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%22da6e23bc47f31c1cf0af122ad8d8fd58%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A14%3A%22111.91.142.180%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A120%3A%22Mozilla%2F5.0+%28Macintosh%3B+Intel+Mac+OS+X+10_9_4%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F36.0.1985.125+Safari%2F537.36%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1407342562%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3Bs%3A10%3A%22w_test_acc%22%3Bb%3A0%3Bs%3A10%3A%22w_user_idx%22%3Bs%3A7%3A%222923261%22%3Bs%3A9%3A%22w_user_id%22%3Bs%3A19%3A%22woogenius%40naver.com%22%3Bs%3A14%3A%22w_adult_status%22%3Bs%3A1%3A%221%22%3Bs%3A15%3A%22w_user_coin_web%22%3Bs%3A1%3A%220%22%3Bs%3A15%3A%22w_user_coin_and%22%3Bs%3A1%3A%220%22%3Bs%3A15%3A%22w_user_coin_ios%22%3Bs%3A1%3A%220%22%3Bs%3A18%3A%22w_user_coin_silver%22%3Bs%3A1%3A%220%22%3Bs%3A12%3A%22w_user_point%22%3Bs%3A1%3A%220%22%3Bs%3A11%3A%22comic_arrow%22%3Bs%3A1%3A%221%22%3Bs%3A14%3A%22thinkpool_user%22%3BN%3Bs%3A16%3A%22thinkpool_userip%22%3BN%3Bs%3A9%3A%22w_partner%22%3BN%3Bs%3A13%3A%22w_join_device%22%3Bs%3A1%3A%220%22%3Bs%3A11%3A%22w_coupon_id%22%3BN%3Bs%3A14%3A%22w_coupon_point%22%3Bs%3A1%3A%220%22%3B%7Dbaeecb9e11041593dfce5a0da276a0e4',
'Host':'www.toptoon.com',
'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36'
};

for (var j = 0; j < 4000; j++) {
	(function(e, f) {
		var url = 'http://www.toptoon.com/img/ep_content/'+e+'/'+f;
        request({url:url, headers:headers}, function (err, res, body) {
        	if (res.statusCode == 200) {
        		console.log(url + " : " + res.statusCode);
        	};
		});
    })(238, j);
};





