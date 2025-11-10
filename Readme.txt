cmd:
frontend -> npm start

backend -> nodemon index.js
Terminal A:
set DEVICE_ID=dev-a
set DEVICE_NAME=DevA
set PORT=5000

copy and paste line by line not all at once

backend -> nodemon index.js
Terminal B:
set DEVICE_ID=dev-b
set DEVICE_NAME=DevB
set PORT=5001


next :
1. when we start the servers, without any user actions without clicking on any button it starts the discovery and finds the peer as well. Need to fix. When user clicks on "Search to connect" or "Receive" then the broadcast and search should start. 

