/**
 * Function for calling Intercom API.
 */
var call_intercom_api = function(url, successHandler, errorHandler) {
		intercom_api = 'https://api.intercom.io';
		url = intercom_api + url;
		var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('get', url, false); // false here sets to synchronous mode. Really important for this to be synchronous.
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Authorization", "Basic " + btoa(intercom_user + ":" + intercom_pass));
		xhr.send(null);
		if (xhr.status === 200) {
			return JSON.parse(xhr.responseText);
		}
	};

var call_intercom_api_post = function(url, data) {
		intercom_api = 'https://api.intercom.io';
		url = intercom_api + url;
		var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('post', url, true); // false here sets to synchronous mode. Really important for this to be synchronous.
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader("Authorization", "Basic " + btoa(intercom_user + ":" + intercom_pass));
		xhr.onreadystatechange = function() {//Call a function when the state changes.
		    if(xhr.readyState == 4 && xhr.status == 200) {
				console.log(JSON.parse(xhr.responseText));
		    }
		}
		xhr.send(data);
		if (xhr.status === 200) {
			return JSON.parse(xhr.responseText);
		}
	};	
	
/**
 * Function for calling Desk API.
 */
var call_desk_api = function(data, path = '', method='POST',successHandler, errorHandler) {
		url = 'https://pantheon-systems.desk.com/api/v2/';
		if (path != '') {
			url = url + path;
		}
		var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open(method, url, false); // false here sets to synchronous mode.
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
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
var users = {};
function getIntercomUser(userID, type) {
	if (users[userID]) return users[userID];
	url = (type == 'user') ? '/users/' : '/admins/';
	url += userID;
	user = call_intercom_api(url);
	users[userID] = {
		name: user.name,
		email: user.email,
		user_id: user.user_id,
		custom: user.custom_attributes
	}
	return users[userID];
}

/**
 * Get user information based on Intercom Conversation ID.
 */
function getIntercomUserViaConversation(conversationID) {
	url = '/conversations/' + conversationID
	data = call_intercom_api(url);
	if (data.conversation_message) {
		user = getIntercomUser(data.conversation_message.author.id, data.conversation_message.author.type);
		return user;
	}
}	

/**
 * Parse Intercom conversation.
 */
function getIntercomConversation(conversationID, callback, errorCallback) {
	var authors = [];
	var convo = {};
	var type = "";
	var body = "";
	url = '/conversations/' + conversationID
	data = call_intercom_api(url);
	if (data.conversation_message) {
		user = getIntercomUser(data.conversation_message.author.id, data.conversation_message.author.type);
		author = user;
		messages = data.conversation_parts.conversation_parts;

		convo['comment'] = convo['note'] = convo['close'] = convo['open'] = "";
		
		convo['comment'] =  "*" + author.name + "* [Chat Start]\n";
		convo['comment'] += html2textile(data.conversation_message.body);

		var oper = ""
		if (data.conversation_parts.conversation_parts) {
			for (i = 0; i < messages.length; i++) {
				if (messages[i].part_type != 'assignment') {

					if(messages[i].part_type == 'close') {
						messages[i].part_type = "comment";	
						oper = " [Chat Closed] \n";
					} else if(messages[i].part_type == 'open') {
						messages[i].part_type = "comment";	
						oper = " [Chat ReOpen] \n";						
					} else {
						oper = "";
					}
					
					user = getIntercomUser(messages[i].author.id, messages[i].author.type);
					convo[messages[i].part_type] += "*" + user.name + "* "+oper+"\n";
					var type = "";
					for (j = 0; j < messages[i].attachments.length; j++) {
						type = String(messages[i].attachments[j].content_type);
						if (type.split("/")[0] == "image") {
							convo[messages[i].part_type] += "!" + messages[i].attachments[j].url + "(" + messages[i].attachments[j].name + ")! \n";
						} else {
							if (messages[i].attachments[j].name == messages[i].attachments[j].url) {
								convo[messages[i].part_type] += messages[i].attachments[j].url + " \n";
							} else {
								convo[messages[i].part_type] += '"' + messages[i].attachments[j].name + '":' + messages[i].attachments[j].url + " \n";
							}
						}
					}
					if (typeof messages[i].body === "undefined" || messages[i].body == null || messages[i].body == "") {
						body = "";
					} else {
						body = "";
						body = html2textile(messages[i].body);
												
						if(messages[i].part_type == "note") {
							body = strip_tags(body)+"\n";							
						} else {
							body = strip_tags(body) + "\n\n\n";
						}	
					}
					convo[messages[i].part_type] += body;									
				}
			}
		}

	}
	renderMessage("Transcript collected...");			        			
	callback(convo.comment, convo.note, author);
}


/**
 * Better formatter for Desk
 **/
function html2textile(msg) {
    var body = "";
	body = String(msg).trim();
	body = body.replace("<pre>", "\n\nbc.. ");
	body = body.replace("</pre>", "\n\np. ");
	body = body.replace("<b>", "*");
	body = body.replace("</b>", "*");
	body = body.replace("<i>", "_");
	body = body.replace("</i>", "_");
	body = body.replace("<h1>", "\n\nh1. ");
	body = body.replace("</h1>", "\n\n");
	body = body.replace("<h2>", "\n\nh2. ");
	body = body.replace("</h2>", "\n\n");
	body = body.replace("<p>", "");
	body = body.replace("</p>", "\n\n");
	var match = [];
	body.replace(/[^<]*(<a href="([^"]+)"(.*)>([^<]+)<\/a>)/g, function() {
		match = Array.prototype.slice.call(arguments, 1, 5);
		if (match[3] == match[1]) {
			body = strip_tags(body);
			body = body.replace(match[3], "");
			body += match[3] + " \n";
		} else {
			body += '"' + match[3] + '":' + match[1] + " \n";
		}
	});
	body.replace(/[^<]*(<img src="([^"]+)">)/g, function() {
		match = Array.prototype.slice.call(arguments, 1, 4);
		body += "!" + match[1] + "! \n";
	});
	return body;
}


/**
 * Creates a json object that will be used to call Desk's API and create a case.
 */
function desk_create_case(subject, site_uuid, email, message) {
	renderMessage("Creating Desk Ticket...");			        				
	var desk_case = {
		"type": "email",
		"subject": subject,
		"status": "open",
		"labels": ["Chat"],
		"message": {
			"direction": "out",
			"status": "sent",
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
	return call_desk_api(JSON.stringify(desk_case), 'cases');
}

function desk_create_note(case_id, note) {
	var desk_note = {
		"body": note
	}
	call_desk_api(JSON.stringify(desk_note), 'cases/' + case_id + '/notes');
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++ Main script start here +++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var summary = "";
var site_uuid = "";
var subject = "";
var conversationID = "";
document.addEventListener('DOMContentLoaded', function() {
	var conversation = "";
	var url = "";
	renderMessage("This will take a few seconds to process.");
	// Getting the conversation ID from the intercom url.
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(arrayOfTabs) {
		// Since only one tab should be active and in the current window at once
		// the return variable should only have one entry.
		var activeTab = arrayOfTabs[0];				
				
		url = activeTab.url;
		var res = url.match(/conversations\/[\w-]+/g);
		conversationID = res[0].split("/")[1];
		// Prefilling the conversation ID in the UI.
		document.getElementById('intercom-conversation-id').value = conversationID;
		if (!(typeof getCookie(conversationID + '_subject') === 'undefined')) {
			document.getElementById('subject').value = getCookie(conversationID + '_subject');
		}
		if (!(typeof getCookie(conversationID + '_summary') === 'undefined')) {
			document.getElementById('summary').value = getCookie(conversationID + '_summary');
		}
		if (!(typeof getCookie(conversationID + '_site') === 'undefined')) {
			document.getElementById('site').value = getCookie(conversationID + '_site');
		}
		
	});
	
	
	//Lets try to load site-id
	var search_siteid = document.getElementById('search_siteid');
	search_siteid.addEventListener('click', function() {
		search_siteid.innerHTML = "<img style='margin-top: 4px; width: 12px; height: 13px;' src='/loading.gif'>";
		setTimeout(function(){ 
			var site_id = "";
			var user_info = getIntercomUserViaConversation(conversationID);
			if(typeof user_info.custom.most_recent_site_viewed === "undefined") {
				renderError('Site UUID not available');
				search_siteid.innerHTML = "&#x1f50d;";
			} else {
				if(user_info.custom.most_recent_site_viewed.indexOf('/sites/') !== -1) {
					document.getElementById('site').value = user_info.custom.most_recent_site_viewed.replace('https://admin.dashboard.pantheon.io/sites/','');
					setCookie(conversationID + '_site', document.getElementById('site').value, 1);				
				} else {
					renderError('Site UUID not available');	
				}
				search_siteid.innerHTML = "&#x1f50d;";
			}
			
		}, 500);
	});
	
	
	var send_to_desk = document.getElementById('send-to-desk');
	// Adding a listener to the Send To Desk button.
	send_to_desk.addEventListener('click', function() {
		conversationID = document.getElementById('intercom-conversation-id').value;
		if (!conversationID || conversationID == '') {
			renderError("Please add a conversation ID.");
			return;
		}

		$(function(){
		    progress(send_to_desk).done(function(){
		        renderMessage("Collecting transcript...");		        		        
		        getConversation(conversationID).done(function(){
		            console.log('Pulling Conversation ('+conversationID+') Completed!');
		        });
		    });
		});
	});
	
	var admin_close = document.getElementById('admin_close');
	admin_close.addEventListener('click', function() {
		var body = "";
	    var url = "/conversations/"+conversationID+"/reply";
	    		
		if(document.getElementById('close_message').value != "") {
			body = document.getElementById('close_message').value;
		} else {
			body = "This chat session has ended.";
		}
		
	    var data = { 
	    	"admin_id": "873699", 
	    	"body": body,
	    	"message_type": "close", 
	    	"type": "admin"
	    };

		call_intercom_api_post(url, JSON.stringify(data));
		document.getElementById('close_message').value = "";
	});
	
	//Load Desk Macros
	var macros = call_desk_api(null,'macros?page=1&per_page=200','GET');
	
	var options = {
	  shouldSort: true,
	  threshold: 0.3,
	  location: 0,
	  distance: 100,
	  maxPatternLength: 32,
	  keys: [
	    "name",
	    "id"
	]
	};

//    console.log(JSON.stringify(macros._embedded.entries));
	var fuse = new Fuse(macros._embedded.entries, options);
	var macros_result = jQuery('#macros_result');
	var search_macros = document.getElementById('macros');
	search_macros.addEventListener('keyup', function() {
		 if(search_macros.value.length > 3) {
		    jQuery('#macros_result').fadeIn('fast');  
			var macros_items = "<ul>";
			jQuery.each(fuse.search(search_macros.value), function(i, v){
				macros_items += "<li rel-id='"+v.id+"'>"+v.name+"</li>";
			});
			macros_items += "</ul>";
			macros_result.html(macros_items);
		 } else {
			macros_result.html("");
		    jQuery('#macros_result').fadeOut('fast');  			
		 }
	});	
	
    jQuery(document).on('click','#macros_result li', function(){
	   var macro_show = call_desk_api(null,'macros/'+jQuery(this).attr('rel-id')+'/actions','GET');
	   jQuery('#macros_result').fadeOut('fast'); 

	   var macro_text =  macro_show._embedded.entries.find((item) => item.type === 'set-case-quick-reply').value;

		chrome.tabs.executeScript(null,{
//			code: "var macro_text="+JSON.stringify(macro_text)+";"
//			code: 'var macro_text="'+macro_text+'";'

			code: "var macro_text=`" + macro_text + "`;"
		}, function(){
			chrome.tabs.executeScript(null, {file:"macro.js"})
		});
	});
});

/**
 * Making sure the cookies is set before starting so it's not undefined.
 */
jQuery(document).on('keyup blur', 'input[type=text], textarea', function() {
	if (!(typeof getCookie(conversationID + '_subject') === 'undefined')) {
		setCookie(conversationID + '_subject', document.getElementById('subject').value, 1);
	}
	if (!(typeof getCookie(conversationID + '_summary') === 'undefined')) {
		setCookie(conversationID + '_summary', document.getElementById('summary').value, 1);
	}
	if (!(typeof getCookie(conversationID + '_site') === 'undefined')) {
		setCookie(conversationID + '_site', document.getElementById('site').value, 1);
	}
});

/**
 * Locking send button and showing circle progress icon.
 */
function progress(send_button){
    var dfrd = $.Deferred();
    console.log(send_button);
	send_button.style.background = "#AAAAAA";
	send_button.disabled = true;
	document.getElementById("progress").innerHTML = "<img style='margin-bottom: -7px; width: 25px; height: 25px;' src='/loading.gif'>";
    dfrd.resolve();
    return dfrd.promise();
}

/**
 * Helper for Getting Conversation and Sending to Desk 
 * (using defered and promise, overcoming assync/nonblocking 
 * so progress icon will show before anything else)
 */
function getConversation(conversationID) {
    var dfrd1 = $.Deferred();
	setTimeout(function(){
		getIntercomConversation(conversationID, function(conversation, notes, author) {
			renderMessage("Transcript collected...");			        			
			subject = "[Chat " + conversationID + "] " + document.getElementById('subject').value;
			site = document.getElementById('site').value;
			summary = document.getElementById('summary').value;
			if (summary != "") {
				conversation = summary + "\n\n-----\n\n" + conversation;
			}
			// Call desk api.
			result = desk_create_case(subject, site, author.email, conversation);
			if (result.id != '') {
				notes += "\n-----\nIntercom Chat URL:  https://app.intercom.io/a/apps/xkegk7cr/inbox/conversation/" + conversationID + " \n";
				notes += "On this Chat: \n";
				jQuery.each(users, function(i, user) {
					notes += user.name + " (" + user.email + ") \n";
				});
				notes += "-----"
				desk_create_note(result.id, notes);
				
				renderMessage("Sent to Desk!");

				var create_note_msg  = "Desk: Ticket <a target='_blank' href='https://pantheon-systems.desk.com/agent/case/" + result.id + "'>#" + result.id + "</a> created successfully.<br>";
				 	create_note_msg += "Dashboard: Ticket <a target='_blank' href='https://dashboard.pantheon.io/sites/" + document.getElementById('site').value + "#support/ticket/" + result.id + "'>#" + result.id + "</a> created successfully.";

			    var data = { 
				    "type": "admin",
			    	"admin_id": "873699", 
			    	"body": create_note_msg,
			    	"message_type": "note"
			    };
		
				call_intercom_api_post("/conversations/"+conversationID+"/reply", JSON.stringify(data));
							
				document.getElementById('main').style.display = 'none';
				document.getElementById('subject').value = "";
				document.getElementById('site').value = "";
				document.getElementById('summary').value = "";
				document.getElementById('intercom-conversation-id').value = "";
				document.getElementById("progress").innerHTML = "";
				setCookie(conversationID + '_subject', document.getElementById('subject').value, 1);
				setCookie(conversationID + '_summary', document.getElementById('summary').value, 1);
				setCookie(conversationID + '_site', document.getElementById('site').value, 1);
			}	
		}, function(errorMessage) {
			renderError('Error: ' + errorMessage);
		});
		

	    dfrd1.resolve();
	},500);
	    
    return dfrd1.promise();
}

/**
 * Set Cookie Helper (Persistent value for form)
 */
function setCookie(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

/**
 * Get Cookie Helper (Persistent value for form)
 */
function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
}


