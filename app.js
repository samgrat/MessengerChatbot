/*
 * based upon https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

///////////////          DEPENDENCIES           ///////////////////
'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const API_URL_SERVER = process.env.API_URL_SERVER;
// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
///////////////////////////////////////////////////////////////////

//////////////////          ROUTES           //////////////////////     TODO: add routes for data storage and data retrieving via webapp
// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
body.entry.forEach(function(entry) {

  // Gets the body of the webhook event
  let webhook_event = entry.messaging[0];
  console.log(webhook_event);


  // Get the sender PSID
  let sender_psid = webhook_event.sender.id;
  console.log('Sender PSID: ' + sender_psid);

  // Check if the event is a message or postback and
  // pass the event to the appropriate handler function
  if (webhook_event.message) {
    handleMessage(sender_psid, webhook_event.message);        
  } else if (webhook_event.postback) {
    handlePostback(sender_psid, webhook_event.postback);
  }
  
});

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});
// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "token123";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);  
    }
  }
});
///////////////////////////////////////////////////////////////////

///////////////          HANDLERS           ///////////////////////
// Handles postback events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function getSenderState(sender_psid){
  
}

// Send every message passed in argument
function sendMessages(sender_psid){
  var i;
  let response;
  for (i = 1; i < arguments.length; i++) {
    response = {
      "text": arguments[i]
    }
    callSendAPI(sender_psid, response);
  }
}

function insertInfoDB(state, sender_psid, received_message){
  // we send the data the the right field according to state
  switch(state){
    case "1": callPostDB(sender_psid, received_message, "gender");
    break;
    case "2": callPostDB(sender_psid, received_message, "class");
    break;
    case "3": callPostDB(sender_psid, received_message, "firstName");
    break;
    case "4": callPostDB(sender_psid, received_message, "lastName");
    break;
    case "5":
    case "6":
    case "6bis": callPostDB(sender_psid, received_message, "handicap");
    break;
    case "7": callPostDB(sender_psid, received_message, "equipment");
    break;
    case "7": callPostDB(sender_psid, received_message, "equipment");
    break;
    
              }
  
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;
  
  // Checks if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    
    let state = getSenderState(sender_psid);
    
    insertInfoDB(state, sender_psid, received_message.text);
                 

           
                }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } 
  
  // Send the response message
  if(received_message.text.includes('Send')){
    callSendAPI(sender_psid, response);
  } else if (received_message.text.includes('Check personal items')){
    callGetOneDB(sender_psid);
  } else if (received_message.text.includes('Check all items')){
    callGetDB(sender_psid);
  } else if (received_message.text.includes('Add item')){
    callPostDB(sender_psid, received_message.text.replace('Add item ', ''));
  } else {
    response = {
      "text": ' Send <something>, \n Check personal items, \n Check all items or \n Add item <item>'
    }
    callSendAPI(sender_psid, response);
  }
}

// Get the contact with corresponding to sender's id
function callGetOneDB(sender_psid) {
   // Send the HTTP request to the Messenger Platform
  request({
    "url": URL_SERVER_API + '/' + sender_psid,
    "method": "GET"
  }, (err, res, body) => {
    if (!err) {
      let response = {
      "text": body
      }
      console.log(res)
      console.log(body)
      callSendAPI(sender_psid, response)
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
  
}

// Get all the contacts in the database
function callGetDB(sender_psid) {
   // Send the HTTP request to the Messenger Platform
  request({
    "url": URL_SERVER_API,
    "method": "GET"
  }, (err, res, body) => {
    if (!err) {
      let response = {
      "text": body
      }
      console.log(res)
      console.log(body)
      callSendAPI(sender_psid, response)
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
  
}

// Create a new contact in the database
function callPostDB(sender_psid, data, field) {
    // Construct the message body
  let request_body = {
    "_id": sender_psid,
    field: data
  }
  
   // Send the HTTP request to the Messenger Platform
  request({
    "url": URL_SERVER_API."/contacts/".sender_psid,
    "method": "POST",
    "json" : request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(res)
      console.log(body)
      console.log('info added to DB')
    } else {
      console.error("Unable to add info:" + err);
    }
  }); 
  
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  
   // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(res)
      console.log(body)
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}
