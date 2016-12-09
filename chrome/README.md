# Chrome extension for sending intercom conversations to desk.

## Instalation instructions

1) Generate your Intercom API key by going to Intercom's App Settings / API Keys.

2) Clone the repo locally and edit `chrome/popup.js`. Search for the lines below and replace them with your actual API keys and desk username and password. These are needed in order to connect to Intercom's and Desk's API.

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

You should now see a Pantheon icon on the upper-right corner of your Google Chrome browser. Whenever you want to send a conversation to Desk, you should go to the actual conversation in Intercom (the one that has something like conversations/6621023537 in the url) and hit that button. A form should appear that would send the conversation to a desk ticket.

![Chrome Developer Mode](http://content.screencast.com/users/AlexDicix/folders/Jing/media/06a092c0-9c53-476e-94b1-ccce89c1406c/00000778.png)
