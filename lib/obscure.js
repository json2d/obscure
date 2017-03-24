var cheerio = require('cheerio');
var Hashids = require("hashids"),
    hashids = new Hashids();

function Obscure() {

  this.prefix = "obscure-"
  this.seed = (new Date()).getTime();

  this.init = function(targets) {
    if(Array.isArray(targets)) {
      this.targets = targets.slice(0)
      this.rules = targets.map(createRule)
    }else{
      throw new Error("non array arg not yet supported")
    }
  }

  const createRule = (target,i) => {
    var obfused = hashids.encode(i+this.seed);
    return {
      sym: target[0],
      target: target.substring(1),
      obfused: this.prefix + obfused
    }
  }

  const html = (data) => {

    let $ = cheerio.load(data,{decodeEntities: true});

    this.rules.forEach( (rule) => {
       if(rule.sym == '#') {
         $('#' + rule.target).attr('id',rule.obfused);
       }else if(rule.sym == '.') {
         $('.' + rule.target).removeClass(rule.target).addClass(rule.obfused);
       }else{
         throw new Error("CSS symbol " + rule.sym + " not yet supported");
       }
    })

    return $.html();
  }

  const css = (data) => {

    this.rules.forEach( (rule) => {
      var re = new RegExp("\\" + rule.sym + rule.target + "(?=[#.,\\{\\[\\(\\s])","g")
      data = data.replace(re, rule.sym + rule.obfused);
    })

    return data;
  }

  const transformer = {html,css}

  this.transformSync = function(type,data) {
    return transformer[type](data);
  }
}


module.exports = Obscure
