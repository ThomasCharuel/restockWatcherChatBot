const express = require('express');

const app = express();

app.get('/', function(req, res){
    res.send('Hello World!')
})


app.listen(80, () => {
    console.log('Server listening on port 80');
})


// https.get('https://www.lynda.com/', res => {
//     console.log('Response status code: ', res.statusCode);

//     res.on('data', chunk => {
//         console.log(chunk.toString());
//     });
// });