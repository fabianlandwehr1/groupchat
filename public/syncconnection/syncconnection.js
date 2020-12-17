//Adds a user to the bubbleAlgo. Note that the bubblealgo needs to be run from scratch (since the graph changed), if either of those 2 methods is called.
function addOnlineUserBubble(userId, x, y) {
  globPlayerXs.push(x);
  globPlayerYs.push(y);
  globPlayerAssignments.push(Math.max(globPlayerAssignments) + 1);
  globPlayerIdToIndexStore[userId] = globPlayerXs.length - 1;
}

//Removes a user from the bubbleAlgo
function removeOnlineUserBubble(userId) {
  let myIndex = globPlayerIdToIndexStore[userId];
  globPlayerXs.splice(myIndex, 1);
  globPlayerYs.splice(myIndex, 1);
  globPlayerAssignments.splice(myIndex, 1);
  delete globPlayerIdToIndexStore[userId];
}