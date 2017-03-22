# obscure
*by Jason Yung - [http://callmejay.com](http://callmejay.com "http://callmejay.com")*

no nonsense obfuscation for html/css based frontend applications

### Installing to Command Line

	$ npm install -g obscure

### Basic Usage
	
	$ obscure style.css --apply index.html

This will grab all **ids and classes** (which I'm calling **definitions**) from `style.css` to be obfuscated, and apply that obfuscation to `index.html` (as well as `style.css` itself)

### Output Directory

	$ obscure style.css --apply index.html --output ./obfuscated
Use `--output` to specify where the obfuscated source files will be written

### Exclusion 

	$ obscure style.css --exclude bootstrap.css

You might have some **definitions** in you CSS that should not be obfuscated.  No problem, just `--exclude`

### Batch Support	
Most likely you will be obfuscating multiple source files together.  
Here's some examples on how to get that done:

##### List
	
	$ obscure style.css,other.css --apply index.html,other.html

##### Glob

	$ obscure *.css --apply *.html

##### Mixed

	$ obscure *.css,app/style.css --apply *.html,app/index.html
