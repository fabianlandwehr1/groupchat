Structure of this folder:

index.html, main.css, main.js -> The main html, css and js file. Please be carefull when updating those to not create merge conflicts.
userbubble -> Contains general stuff for the userbubble, ie associated css files + code that generates a userbubble (an actual visible object) given a name and an avatar
localuserbubble -> Contains stuff for the local user bubble, especially it's dragging functionality.
remoteuserbubble -> Contains all the things for adding and controlling the userbubbles of other users (especially their update code)
syncconnection -> Contains everything which actually starts a call in a group (if bubbles are close enough to each other), usw. Therefore it's coupled quite directly to localuserbubble and remoteuserbubble.
localusercontrols -> Contains everything related to the controls of the local user, eg the mute-button.
offlinemsg -> Contains stuff required for leaving notifications, and messages (? How should we even do that ;x). Guess this is lowest priority for now

Please declare all global variables directly in the <script> block in the html file. Note that there
already are global variable for all the user bubbles, the plane where users can move and the offlinearea.
