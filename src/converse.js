// Check and display available size for a shoe on the converse website
// Product page example: http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.html?lang=fr_FR

const
    cheerio = require('cheerio');

//lynx http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.ng=fr_FR -source

var exec = require('child_process').exec;

var cmd = 'lynx http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.html?lang=fr_FR -source';

exec(cmd, function(error, stdout, stderr) {

    const $ = cheerio.load(stdout);

    const sizesOptions = 
        $('#sizes')
        .first()
        .children('option')
        .filter(function(i, el){
            return $(this).attr('value') !== '';
        })
        .map(function(i, el){
            return $(this).text();
        }).get();

    sizesOptions.forEach((size) => console.log(size))
});