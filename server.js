const 
    express = require('express'),
    https = require('https'),
    config = require('config'),
    fs = require('fs');

const app = express();

// Create an HTTP service.
app.listen(80, () => {
    console.log('Server listening on port 80');
})

const options = {
    key: fs.readFileSync(config.get('privateKeyPath')),
    cert: fs.readFileSync(config.get('serverCertificatePath'))
}

// Create an HTTPS service identical to the HTTP service
https.createServer(options, app).listen(443);


app.get('/', function(req, res){
    res.send('Hello World!')
});


// https.get('https://www.lynda.com/', res => {
//     console.log('Response status code: ', res.statusCode);

//     res.on('data', chunk => {
//         console.log(chunk.toString());
//     });
// });