// Check and display available size for a shoe on the converse website
// Product page example: http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.html?lang=fr_FR

var
    cheerio = require('cheerio');

//lynx http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.ng=fr_FR -source

var execFile = require('child_process').execFile;


// Return the available sizes for a given url
// Ex: array returned [35, 42]
// If no sizes found return 
exports.getAvailableSizes = function(url, callback){
    var cmd = `lynx ${ url } -source`;
    
    var sizesOptions = [];
    
    execFile('lynx', [url, '-source'], (error, stdout, stderr) => {
        if (error) {
            console.error('stderr', stderr);
            callback(sizesOptions);
            throw error;
        }
        
        var $ = cheerio.load(stdout);

        sizesOptions = 
            $('#sizes')
            .first()
            .children('option')
            .filter(function(i, el){
                return $(this).attr('value') !== '';
            })
            .map(function(i, el){
                return $(this).text();
            }).get();

        console.log('Sizes found: ');
        console.dir(sizesOptions);
        
        callback(sizesOptions);
    });
}   

