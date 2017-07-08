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



/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

/*
* Use your own validation token. Check that the token used in the Webhook 
* setup is the same token used here.
*
*/
app.get('/webhook', function(req, res) {
if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
} else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
}  
});

app.post('/webhook', function(req, res){
    const data = req.body;

    console.dir(data);

    // Make sure this is a page subscription
    if(data.object === 'page'){

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry){
            const pageID = entry.id;
            const timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function(event){
                if(event.message)
                    receivedMessage(event);
                else   
                    console.log("Webhook received unknown event: ", event);
            });
        });

        // Assume all went well
        //
        // You must send a 200, within 20 seconds, to let us know
        // you have successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend
        res.sendStatus(200);
    }
});

function receivedMessage(event){
    // Putting a stub for now, we'll expand it in the following steps
    console.log("Message data: ", event.message);
}


// https.get('https://www.lynda.com/', res => {
//     console.log('Response status code: ', res.statusCode);

//     res.on('data', chunk => {
//         console.log(chunk.toString());
//     });
// });