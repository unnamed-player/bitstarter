#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rstlr = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(url,checkfile) {
        var res = '';
        rstlr.get(url).on('complete', function(res) {
                if (res instanceof Error) {
                        console.log('Error: ' + res.message);
                } else {
                        checkResult(res,checkfile);
                }
        });
};

var checkResult = function(result,checksfile) {
        $ = cheerio.load(result);
        var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkUrl = function(url, checksfile) {
    cheerioUrl(url,checksfile);
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url [url]', 'url to html file')
        .parse(process.argv);
    var checkJson = '';
    if (program.url) {
//        console.log('Url ' + program.url);
        checkUrl(program.url,program.checks);
    }
    else if(program.file) {
		var checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
    } 
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
