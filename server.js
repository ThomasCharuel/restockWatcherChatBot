const http = require('http');

const server = http.createServer(function(req, res){
    res.writeHead(200);
    res.end('Salut tout le monde');
});
server.listen(8080);

// https.get('https://www.lynda.com/', res => {
//     console.log('Response status code: ', res.statusCode);

//     res.on('data', chunk => {
//         console.log(chunk.toString());
//     });
// });