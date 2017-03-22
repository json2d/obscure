var TAAG ="\n     ____  ____  ____  ____  _     ____  _____\n    /  _ \\/  _ \\/ ___\\/   _\\/ \\ /\\/  __\\/  __/\n    | / \\|| | //|    \\|  /  | | |||  \\/||  \\  \n    | \\_/|| |_\\\\\\___ ||  \\_ | \\_/||    /|  /_ \n    \\____/\\____/\\____/\\____/\\____/\\_/\\_\\\\____\\"

//obscure style.css --exclude css\bootstrap.min.css --apply single.php,single-video.php,frontpage.php,footer.php,footer-social.php,content.php,page.php,partials\cards\mini.php,partials\cards\video.php,partials\cards\audio.php,partials\cards\post.php,header.php

process.argv[1]='obscure'; //rename for commander
var obscure = require('../index.js')
var program = require('commander');

program
	.usage("<include> [options]")
	.version('1.0.1')
	.arguments('<include>')
	.option('-o, --output <output>', 'directory to output obfuscated files')
	.option('-e, --exclude <exclude>', '.css file(s) containing definitions (classes and ids) to be excluded from obfuscation')
	.option('-a, --apply <apply>', '.html file(s) to be obfuscated using the included definitions')
	.option('-s, --seed <seed>', 'seed value for obfuscation term generation')
	.action(function(include) {
    console.log(TAAG);

		if(include == undefined) console.log(program.helpInformation());
		else {
			program.include = include;

			if(program.seed) program.seed = parseInt(program.seed);

			if(program.output && program.output[program.output.length-1] != '/') program.output += '/';

	    	obscure(program); //main entry point
	    }
	})
	.parse(process.argv)
