function setUsernameCookie(username = USERNAME) {
  console.log("setUsernameCookie", username);
  deleteUsernameCookie();
	document.cookie = "username=" + username + "; expires=Fri, 01 Jan 2100 00:00:00 UTC; path=/";
}

function getUsernameCookie() {
  console.log("getUsernameCookie")
	return _getCookie("username")
}

function usernameCookieExists() {
	if (getUsernameCookie() == "") {
    return false;
  } else {
    return true;
  }
}

function deleteUsernameCookie() {
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
}



function setRoomIdCookie(room_id) {
  console.log("setRoomIdCookie",room_id);
  deleteRoomIdCookie();
  document.cookie = "room_id=" + room_id + "; expires=Fri, 01 Jan 2100 00:00:00 UTC; path=/";
}

function deleteRoomIdCookie() {
  document.cookie = "room_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
}

function getRoomIdCookie() {
  console.log("getRoomIdCookie")
  return _getCookie("room_id");
}

function roomIdCookieExists() {
  return getRoomIdCookie() != "";
}



function setAvatarCookie(url) {
  console.log("setAvatarCookie",url);
  deleteAvatarCookie();
  document.cookie = "avatar_url=" + url + "; expires=Fri, 01 Jan 2100 00:00:00 UTC; path=/";
}

function deleteAvatarCookie() {
  document.cookie = "avatar_url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

}

function getAvatarCookie() {
  console.log("getAvatarCookie");
  return _getCookie("avatar_url")
}

function avatarCookieExists() {
  return getAvatarCookie() != "";
}



function _getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}