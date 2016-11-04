/**
 * Function for calling Intercom API.
 */
var call_intercom_api = function(url, successHandler, errorHandler) {
  intercom_api  = 'https://api.intercom.io';

  intercom_user = 'INTERCOM_APPID';
  intercom_pass = 'INTERCOM_KEY';

  url = intercom_api + url;
  var xhr = typeof XMLHttpRequest != 'undefined'
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP');
    
  xhr.open('get', url, false); // false here sets to synchronous mode. Really important for this to be synchronous.
    
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Authorization", "Basic " + btoa(intercom_user + ":" + intercom_pass));
  xhr.send(null);

  if (xhr.status === 200) {
    return JSON.parse(xhr.responseText);
  }
};

/**
 * Function for calling Desk API.
 */
var call_desk_api = function(data, path='', successHandler, errorHandler) {
  url = 'https://pantheon-systems.desk.com/api/v2/cases';

  if (path != '') {
    url = url + path;
  }

  desk_user = 'DESK_USER';
  desk_pass = 'DESK_PASS';

  var xhr = typeof XMLHttpRequest != 'undefined'
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP');
    
  xhr.open('POST', url, false); // false here sets to synchronous mode.

  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Authorization", "Basic " + btoa(desk_user + ":" + desk_pass));
  xhr.send(data);

  // Desk returns 201 response code when all is ok.
  if (xhr.status === 200 || xhr.status === 201) {
    return JSON.parse(xhr.responseText);
  }
};

/**
 * Error redering function.
 */
function renderError(statusText) {
  document.getElementById('error').innerHTML = statusText;

  document.getElementById('error').style.display = 'block';
  document.getElementById('message').style.display = 'none';
}

/**
 * Message redering function.
 */
function renderMessage(statusText) {
  document.getElementById('message').innerHTML = statusText;

  document.getElementById('error').style.display = 'none';
  document.getElementById('message').style.display = 'block';
}

/**
 * Strip tags and new lines.
 */
function strip_tags(htmlText) {
  var div = document.createElement("div");
  div.innerHTML = htmlText;
  return div.innerText.replace("\n", "");
}

/**
 * Get user information based on Intercom user ids.
 */
var users = [];
function getIntercomUser(userID, type) {

  if (users[userID]) return users[userID];
  
  url = (type == 'user') ? '/users/' : '/admins/';
  url += userID;

  user = call_intercom_api(url);

  users[userID] = {
    name: user.name,
    email: user.email
  }
  return users[userID];
}

/**
 * Parse Intercom conversation.
 */
function getIntercomConversation(conversationID, callback, errorCallback) {
  
  conversation = '';
  notes = '';

  url = '/conversations/' + conversationID
  data = call_intercom_api(url);
  if (data.conversation_message) {
    user = getIntercomUser(data.conversation_message.author.id, data.conversation_message.author.type);
    conversation += user.name + " (" + user.email + "):\n"
    conversation += strip_tags(data.conversation_message.body) + "\n\n";
    author = user;
      
    messages = data.conversation_parts.conversation_parts;
    if (data.conversation_parts.conversation_parts) {
      for (i = 0; i < messages.length; i++) {

        // Only choose comments and notes.
        if (messages[i].part_type == 'note') {
          user = getIntercomUser(messages[i].author.id, messages[i].author.type);
          notes += user.name + " (" + user.email + "):\n"
          notes += 'NOTE: ' + strip_tags(messages[i].body) + "\n\n";
        }
        else if (messages[i].part_type == 'comment') {
          user = getIntercomUser(messages[i].author.id, messages[i].author.type);
          conversation += user.name + " (" + user.email + "):\n"
          conversation += strip_tags(messages[i].body) + "\n\n";
        }
      }
    }
  }

  callback(conversation, notes, author);
}

/**
 * Creates a json object that will be used to call Desk's API and create a case.
 */
function desk_create_case(subject, site_uuid, email, message) {
  var desk_case = {
            "type": "email",
            "subject": subject,
            "status": "open",
            "labels": [
                "Chat"
            ],
            "message": {
                "direction": "in",
                "to": "helpdesk@getpantheon.com",
                "from": email,
                "subject": subject,
                "body": message,
                "body_html": message
          },
          "custom_fields": {
                "site_uuid": site_uuid
            }
        };
  return call_desk_api(JSON.stringify(desk_case));
}

function desk_create_note(case_id, note) {
  var desk_note = {
    "body": note
  }
  call_desk_api(JSON.stringify(desk_note), '/' + case_id + '/notes');
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++ Main script start here +++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

document.addEventListener('DOMContentLoaded', function() {
  renderMessage("This will take a few seconds. Please don't click the 'Send To Desk' button twice.");
  // Getting the conversation ID from the intercom url.
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
      // Since only one tab should be active and in the current window at once
      // the return variable should only have one entry.
      var activeTab = arrayOfTabs[0];
      var url = activeTab.url;
      var res = url.match(/conversations\/[\w-]+/g);
      conversationID = res[0].split("/")[1];
      // Prefilling the conversation ID in the UI.
      document.getElementById('intercom-conversation-id').value = conversationID;
  });

  var send_to_desk = document.getElementById('send-to-desk');
  // Adding a listener to the Send To Desk button.
  send_to_desk.addEventListener('click', function() {
    conversationID = document.getElementById('intercom-conversation-id').value;
    
    if (!conversationID || conversationID == '') {
      renderError("Please add a conversation ID.");
      return;
    }
    
    conversation = getIntercomConversation(conversationID, function(conversation, notes, author) {

      subject = document.getElementById('subject').value;
      site = document.getElementById('site').value;
      summary = document.getElementById('summary').value;

      if (summary != "") {
        conversation = summary + "\n\n" + conversation;
      }

      // Call desk api.
      result = desk_create_case(subject, site, author.email, conversation);
      if (result.id != '') {

        if (notes != '') {
          desk_create_note(result.id, notes);
        }

        renderMessage("Ticket <a target='_blank' href='https://pantheon-systems.desk.com/agent/case/" + result.id + "'>#" + result.id + "</a> created successfully.");
        document.getElementById('main').style.display = 'none';
        document.getElementById('subject').value = "";
        document.getElementById('site').value = "";
        document.getElementById('summary').value = "";
        document.getElementById('intercom-conversation-id').value = "";
      }
      
    }, function(errorMessage) {
      renderError('Error: ' + errorMessage);
    });
  });
});
