const 
    express = require('express'),
    bodyParser = require('body-parser'),
    https = require('https'),
    config = require('config'),
    request = require('request'),
    converse = require('./src/converse.js')
    fs = require('fs');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", 
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    var url, sizes;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
        case 'generic':
            sendGenericMessage(senderID);
            break;

        case 'converse':
            sendConverseSizes(senderID);
            break;
        case 'converse2':
            sendConverse2Sizes(senderID);
            break;
        
        case 'alert':
            console.log('new alert');
            url = 'http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.html?lang=fr_FR';
            sizes = ['42'];

            sendTextMessage(senderID, 'Alert created');
            console.log('init loop alert');
            setTimeout(function(){
                handleSetAlert(senderID, url, sizes)
            }, 10000);
            break;

        case 'alert2':
            console.log('new alert2');
            url = 'http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/142337C_030.html?lang=fr_FR';
            sizes = ['41.5'];

            sendTextMessage(senderID, 'Alert created');
            console.log('init loop alert2');
            setTimeout(function(){
                handleSetAlert(senderID, url, sizes)
            }, 10000);
            break;

        default:
            sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
}

function handleSetAlert(recipientId, url, sizes){

    converse.getAvailableSizes(url, function(availableSizes){

        var availableSize = availableSizes.find(function(size){
            // return true if the available size is among the requested ones, false otherwise
            return sizes.includes(size);
        });
        
        if(availableSize){
            sendTextMessage(recipientId, `Your shoe is available for size: ${ availableSize }. Hurry up! ${ url }`);
        }
    });
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendConverseSizes(recipientId){
    const url = 'http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/146977C_030.html?lang=fr_FR';
    converse.getAvailableSizes(url, function(sizes){
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: sizes.length > 0 ? `Yo, available sizes: ${ sizes.join(', ') }.` : 'No available sizes :('
            }
        };

        callSendAPI(messageData);
    });
}

function sendConverse2Sizes(recipientId){
    const url = 'http://www.converse.com/fr/regular/chuck-taylor-all-star-%2770/142337C_030.html?lang=fr_FR';
    converse.getAvailableSizes(url, function(sizes){

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: sizes.length > 0 ? `Yo, available sizes: ${ sizes.join(', ') }.` : 'No available sizes :('
            }
        };

        callSendAPI(messageData);
    });
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}


// https.get('https://www.lynda.com/', res => {
//     console.log('Response status code: ', res.statusCode);

//     res.on('data', chunk => {
//         console.log(chunk.toString());
//     });
// });
