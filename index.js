#!/usr/bin/env node

var mkdirp = require('mkdirp');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var cheerio = require('cheerio');
var Hashids = require("hashids"),
    hashids = new Hashids("what does that say?");

var DEFINITIONS_CAP = /([#.][\w-]+)/g;

var STRIP = {
	defs : /\{[^\}]*?\}/g,
	comments:  /\/\*[\s\S]*?\*\//g,
	scope: /\([\s\S]*?\)/g,
	query: /\[[\s\S]*?\]/g
}

var SAFE_PREFIX = "obscure-";
var SEED = (new Date()).getTime();
var OUTPUT = './obscure-'+SEED+'/';

function getDefinitions(cssString) {
	//prep csstring, STRIPping out all the defs
	for(var k in STRIP) {
		cssString = cssString.replace(STRIP[k],'');
	}
	var matchs = [];
	var match = DEFINITIONS_CAP.exec(cssString);
	while (match != null) {
		//console.log(match);
		matchs.push(match[1]);
    	match = DEFINITIONS_CAP.exec(cssString);
	}
	return _.uniq(matchs);
}

function globlist(s) {

	var split = s.split(',')
	var list = []
	for (var i in split) {
		var files = glob.sync(split[i]);
		list.push(files)
	}
	return _.uniq(_.flatten(list));
}

function obscure(opts) {

  if(opts.output === undefined) opts.output = OUTPUT
  if(opts.seed === undefined) opts.seed = OUTPUT

	mkdirp.sync(opts.output)

	console.log();
	console.log(" * Obfuscation term generation using seed value of: " + opts.seed);
	console.log(" * Output directory set to: " + opts.output);
	console.log();


	var excluded = [];
	if(opts.exclude) {
		console.log("Building exclusion map...");

		var excludes = opts.exclude ? globlist(opts.exclude) : [];
		for(var e in excludes) {
			var css = fs.readFileSync(excludes[e], 'utf8');

			var defs = getDefinitions(css);

			for(var i = 0; i<defs.length; i++) {
				var selector = defs[i];
				excluded.push(selector);
			}
		}
		console.log(" - " + _.size(excluded) + " excluded definitions ( classes and ids ) found in: " + opts.exclude  )
	}


	console.log("Building inclusion map...");
	var includes = globlist(opts.include)
	var csss = {};
	var map = {};

	for(var t in includes) {
		var path = includes[t];
		var css = fs.readFileSync(path, 'utf8');
		var defs = getDefinitions(css);

		csss[path] = css; //store to obfuscate later

		for(var i = 0; i<defs.length; i++) {
			var selector = defs[i];

			if(_.indexOf(excluded,selector)==-1) {
				var obfused = hashids.encode(i+opts.seed);
				var obj = {
					sym: selector[0],
					origin: selector.substring(1),
					obfused: SAFE_PREFIX + obfused
				}

				map[selector] = obj;
				// map.push(obj);
			}
		}
	}

	console.log(" - " + _.size(map) + " definitions ( classes and ids ) found in: " + opts.include  )

	var doms = {};
	if(opts.apply) {

		console.log("Building apply map...");
		// var applys = opts.apply.split(',');
		var applys = opts.apply ? globlist(opts.apply) : [];

		for(var e in applys) {
			var path = applys[e];
			console.log(path);
			var html = fs.readFileSync(path, 'utf8');
	    	var $ = cheerio.load(html,{decodeEntities: true});

	    	doms[path] = $;
		}
	}


	console.log("Obfuscating definitions...");
	console.log("Obfuscating files...");

	for(var i in map) {
		var obj = map[i];

		for(var t in csss) {
			var css = csss[t];
			var re = new RegExp("\\" + obj.sym + obj.origin + "(?=[#.,\\{\\[\\(\\s])","g")
			csss[t] = css.replace(re,obj.sym+obj.obfused);
		}
		for(var d in doms) {
			var $ = doms[d];
			if(obj.sym == '#') {
				//this one is easy
				$('#' + obj.origin).attr('id',obj.obfused);
			}else if(obj.sym == '.') {
				$('.' + obj.origin).removeClass(obj.origin).addClass(obj.obfused);
			}
		}

	}


	console.log("Writing obfuscated files...");

	for(var t in csss) {
		safeWrite(opts.output + t, csss[t]);
	}

	for(var d in doms) {
		safeWrite(opts.output + d, doms[d].html());
	}
	var allkeys = _.union(_.keys(csss),_.keys(doms));
	console.log(" - " + (_.size(allkeys)) + " obfuscated files were successfully written: " + allkeys.join(',') );

	console.log();
	console.log(" * See generated map for reference: " + opts.output + "obscure.map ");
	safeWrite(opts.output + 'obscure.map', JSON.stringify(map, null, 4) );

}

function safeWrite(fd, buffer) {
	var dir = path.dirname(fd);
	mkdirp(dir,(err)=>{
		if(err) console.error(err);
		else fs.writeFileSync(fd, buffer);
	})
}


module.exports = obscure;
