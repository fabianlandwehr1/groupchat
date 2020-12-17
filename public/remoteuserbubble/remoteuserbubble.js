
//Creates a new remote user and places it on the view. x, y only needed if isOnline = true
function createRemoteUser(userId, userName, isOnline, avatarURL, x=0, y=0) {
    //var view = getUserBubbleView(userName, userAvatar);
    var view = getUserBubbleViewNew(userName,avatarURL, false);

    view.onclick = () => {
      console.log('Remote user clicked')
      textMessageRecepient = userName

      removeExistingSenderDialogForTextMessage()
      displaySenderDialogForTextMessage()
    }

    //localUserBubbleView.set(userId, view);
    if(isOnline) {
        setRemoteUserOnline(userId, view, x, y);
    }
    else {
        setRemoteUserOffline(userId, view);
    }
    return view;
}

//Helper to remove user bubble from wherever it is right now
function _removeUserViewFromParent(userView) {
  var pou = userView.parentElement;
  if(pou != null) {
    pou.removeChild(userView);
  }
}

//Removes a remote user
function removeRemoteUser(userId, userView) {
   setRemoteUserOffline(userId, userView);
   _removeUserViewFromParent(userView);
}

//Removes a user view from the offline area and adds it to the canvas (and translates it)
function setRemoteUserOnline(userId, userView, x, y) {
  _removeUserViewFromParent(userView);

  addOnlineUserBubble(userId, x, y);

  canvas.appendChild(userView);

  userView.style.position = "absolute";
  translateRemoteUser(userId, userView, x, y);
}

//Removes a user from the online area and adds it to the offline area
function setRemoteUserOffline(userId, userView) {
  _removeUserViewFromParent(userView);

  let myIndex = globPlayerIdToIndexStore[userId];
  if(myIndex != null) {	//User was online
	  removeOnlineUserBubble(userId);
  }

  userView.style.position = "static";
  if(localUserBubbleView.parentElement == offlinearea) {
    offlinearea.insertBefore(userView, localUserBubbleView);
  }
  else {
    offlinearea.appendChild(userView);
  }
  setOfflineAreaScrollDown();
}

//Translates the view of a remote user. (x, y in percent of the size of canvas; at the middle of the element)
function translateRemoteUser(userID, userView, x, y) {
  var bb = canvas.getBoundingClientRect();
  let WithOffsetX = (x * bb.width) / 100;
  let WithOffsetY = (y * bb.height) / 100;
  let viewX = WithOffsetX + bb.x - 0.5 * fixedUserBubbleWidth;
  let viewY = WithOffsetY + bb.y - 0.5 * fixedUserBubbleHeight;

  let remoteIndex = globPlayerIdToIndexStore[userID];
  if(remoteIndex == null) {
    console.error("There is someone sending updates who does not exist");
    return;
  }
  globPlayerXs[remoteIndex] = x;
  globPlayerYs[remoteIndex] = y;

  userView.style.position = "absolute";
  userView.style.top = viewY + "px";
  userView.style.left = viewX + "px";
}

//Do we need something to erase a user??
