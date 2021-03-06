/**
 * Created by Han on 12/1/15.
 */

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var baseURL = "https://www.noshfolio.com/restaurants/";

var MenuItems = [];
var Restaurants = [];

var fs = require('fs');
var menustream = fs.createWriteStream('menu.json');
var reststream = fs.createWriteStream('restaurant.json');


var i = 1;

crawl(i);

function crawl(i) {
	if (i == 200) {
		menustream.end();
		return;
	}
	var url = baseURL + i + "";
	request(url, function(error, response, body) {
		if(response.statusCode !== 200) {
			console.log(response.statusCode);
			console.log(i);
			++i;
			crawl(i);
			//menustream.end();
			//return;
		} else {	
			var $ = cheerio.load(body);

			var restname = $('title').text().split(" - ")[0];
			var restaddr = trimText($('.address').text().trim());

			var restaurant = {
				"name": restname,
				"address": restaddr
			}

			reststream.write(JSON.stringify(restaurant) + ",\n");

			var menuURL = url + "/menu";
			request(menuURL, function(error, response, body) {
				if(response.statusCode !== 200) {
					console.log("Crawled through " + i - 1 + "restaurants");
				}
				var $ = cheerio.load(body);
				var categories = $('.category-header-containers > div > h2');
				var categoryitems = $('.text-menu > ul');
				//console.log(categoryitems.children().contents());
				var num_categories = categories.length;
				for (var j = 0; j < num_categories; ++j) {
					var category = categories.eq(j).text();
					category = trimText(category);
					for (var k = 0; k < categoryitems.eq(j).children().length - 1; ++k) {
						var menuitem = categoryitems.eq(j).children().eq(k).children();
						var menuprice = extractPrice(trimText(menuitem.eq(0).text()));
						menuprice = parseFloat(menuprice);
						var menudesc = trimText(menuitem.eq(1).text());
						var menuname = categoryitems.eq(j).children().eq(k).text();
						menuname = trimText(menuname).split(" $" + menuprice)[0];
						var restriction = getRestriction(menuname + " " + category + " " + menudesc);
						var menuobject = {
							"name": menuname,
							"description": menudesc,
							"category": category,
							"dietaryRestriction": restriction,
							"price": menuprice,
							"restaurant": restname
						};
						console.log(menuobject);
						menustream.write(JSON.stringify(menuobject) + ",\n");
						//MenuItems.push(menuobject);
					}
				}
				console.log(i);
				++i;
				crawl(i);
			});
		}
	});
}

function trimText(text) {	//fix later
	var arr = text.split(" ");
	var ret = arr[0];
	for (var i = 1; i < arr.length; i++) {
		if (arr[i] != "\n") {
			ret = ret + " " + arr[i];
			ret = ret.trim();
		}
	}
	return ret;
}

function extractPrice(text) {
	text = text.split(" - ")[0];
	var arr = text.split("$");
	ret = arr[1];
	return ret;
}

function getRestriction(text) {
	text = text.toLowerCase();
	var vegetarian = text.indexOf("vegetarian") > -1	// 1024
	var vegan = text.indexOf("vegan") > -1				// 512
	var gluten = text.indexOf("gluten") > -1			// 256
	var eggs = text.indexOf("eggs") > -1				// 128
	var milk = text.indexOf("milk") > -1				// 64
	var peanuts = text.indexOf("peanut") > -1			// 32
	var treenuts = text.indexOf("tree nut") > -1		// 16
	var fish = text.indexOf("fish") > -1				// 8
	var shellfish = text.indexOf("shellfish") > -1		// 4
	var wheat = text.indexOf("wheat") > -1				// 2
	var soy = text.indexOf("soy") > -1					// 1

	var ret = 0;
	if (vegetarian) ret += 1024;
	if (vegan) ret += 512;
	if (gluten) ret += 256;
	if (eggs) ret += 128;
	if (milk) ret += 64;
	if (peanuts) ret += 32;
	if (treenuts) ret += 16;
	if (fish) ret += 8;
	if (shellfish) ret += 4;
	if (wheat) ret += 2;
	if (soy) ret += 1;

	return ret;
}

/**
function outputFile() {
	var fs = require('fs');
		fs.writeFile("menu.json", MenuItems, function(err) {
	if(err) {
		return console.log(err);
	}

		console.log("The file was saved!");
	});
}

/**
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    description = db.Column(db.String(1000))
    frequency = db.Column(db.Integer, index=True)
    rating_sum = db.Column(db.Integer, index=True)
    category = db.Column(db.String(64))
    dietaryRestriction = db.Column(db.Integer)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'))
    price = db.Column(db.Integer, index=True)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), index=True)
    address = db.Column(db.String(100))
    rating = db.Column(db.Integer, index=True)
    items = db.relationship('MenuItem', backref='restaurant', lazy='dynamic')
    orders = db.relationship('Orders', backref='restaurant', lazy='dynamic')
*/

/**
var START_URL = "http://www.arstechnica.com";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     } else {
       collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     }
  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}
*/