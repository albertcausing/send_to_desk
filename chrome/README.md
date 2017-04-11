# Chrome extension for sending intercom conversations to desk.

## Installation instructions

1) Generate your Intercom API key by going to Intercom's App Settings / API Keys.

2) Clone the repo locally and copy `chrome/example.config.js` to `chrome/config.js` and open it in your text editor. Search for the lines below and replace them with your actual API keys and desk username and password. These are needed in order to connect to Intercom's and Desk's API.

```
intercom_user = 'INTERCOM_APPID';
intercom_pass = 'INTERCOM_KEY';

desk_user = 'DESK_USER';
desk_pass = 'DESK_PASS';
```

3) In Chrome go to chrome://extensions and enable Developer Mode. See 
![Chrome Developer Mode](http://content.screencast.com/users/AlexDicix/folders/Jing/media/fc7ce9b5-879e-48fd-ab51-f518f8b7b2b6/00000775.png)

4) Load the `chrome/` folder using the Load Unpacked Extension button.
![Chrome Developer Mode](http://content.screencast.com/users/AlexDicix/folders/Jing/media/bc54e495-14f0-45a8-b255-edce6e9ff80f/00000776.png)

![Chrome Developer Mode](http://content.screencast.com/users/AlexDicix/folders/Jing/media/90fd6c1a-7621-4c9d-83ca-45c32e3de596/00000777.png)

## How to use
You should now see a Pantheon icon on the upper-right corner of your Google Chrome browser. Whenever you want to send a conversation to Desk, you should go to the actual conversation in Intercom (the one that has something like conversations/6621023537 in the url) and hit that button. A form should appear that would send the conversation to a desk ticket.

![Chrome Developer Mode](https://d1ro8r1rbfn3jf.cloudfront.net/ms_104022/2UcVheEYnxr2cKqO5CJSwFkURrRfGp/Untitled-1%2B%2540%2B100%2525%2B%2528Layer%2B2%252C%2BRGB%252F8%252A%2529%2B%252A%2B2017-04-11%2B21-47-28.jpg?Expires=1492004866&Signature=Wgi9nPvyPCRTogjwjRdjc6Y75HsAIbDGzjzK525TcfoMoUK8s~CwzKSykclKBQAO-baWY~VtrHmo~tgJKVsWpu4CRXU~XN7hrw0E-0TWc4hi36i3bSpMPfHF2DQ-t2TNrHkILa7MAwZ-yJ-H2Xr-Pm~NQ9WZpBRqymZdeNebsbf3V0byc9NAxPNX7URyP6TNFAF-P7aA-PE8n1KxFl9VkVQJJg1qBCeJUi95AMSGeJnIU4BlTFbHd0dW2pz2D6nwqmGERZ9wl4flNgtJFSBDh7SvfEmvdyzBqzAHzcKW2VKL0cyqV~umoMrQZfoPiTeJyIg1zO3oXF8T80-jRncg-Q__&Key-Pair-Id=APKAJHEJJBIZWFB73RSA)

### Send-to-Desk Form/Fields
- Intercom Conversation ID * : Populated automatically when on the active intercom conversation page.
- Conversation Subject * : Serves as Subject of Desk Ticket.
- Summary : Appear within the first part of the Desk Ticket before the transcript of the conversation.
- Site UUID * : Link Desk Ticket to Dashboard Support ticket list. Search Icon help auto populate when UUID value is available.
- Priority : Set the priority of the Desk Ticket.
- Search Labels : Add labels to the Desk Ticket.

### Others
- Close using Pantheon Bot: Close conversation with a message using Pantheon Bot username (Usecase: If the customer unable to reply for a long time, this will look an automated closing of chat)
- Search Macros: Cursor/pointer should be at the chat field as macros will appear where's your cursor is.

## Change Logs:
March 20, 2017
- Integrating priority, labels and splitting the UI into tabs. 
- Search through Desk macros on the "Others" tab.

