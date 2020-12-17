//Returns a view of a userbubble (TODO).

function getUserBubbleViewNew(userName, userAvatarURL, local = false) {

  // these custom avatars might not work anymore
  // if (userName == 'andreas' || userName == 'Andreas') userAvatarURL = 'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortFlat&accessoriesType=Sunglasses&hairColor=BrownDark&facialHairType=Blank&clotheType=Hoodie&clotheColor=Gray01&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light'
  // if (userName == 'Elon' || userName == 'Elon Musk') userAvatarURL = 'https://www.biography.com/.image/t_share/MTY2MzU3Nzk2OTM2MjMwNTkx/elon_musk_royal_society.jpg'

  //console.log(userName)
  let outer = document.createElement("div");
  let img = document.createElement("img");

  var nametag = null;

  if (local) {
    nametag = document.createTextNode( shortenForDisplay( userName ) + " (You)");
    outer.classList.add("local_userbubble");
  } else {
    nametag = document.createTextNode( shortenForDisplay( userName ));
    outer.classList.add("remote_userbubble");
  }

  let mute_icon = document.createElement("img")
  let speaker_icon = document.createElement("img")
  let icon_area = document.createElement("div")
  let user_bubble_wrapper = document.createElement("div")

  outer.appendChild(img);
  outer.appendChild(nametag);
  outer.appendChild(icon_area);
  icon_area.appendChild(mute_icon);
  icon_area.appendChild(speaker_icon);
  outer.classList.add("userbubble");


  img.classList.add("avatar");
  //mute_icon.src = "/../icons/microphone_mute.png";
  mute_icon.src = "/../icons/icons_pas/no_mic_50x50px_fat.svg";
  mute_icon.classList.add("mute_icon");
  mute_icon.classList.add("information_icon");
  //speaker_icon.src = "/../icons/megaphone_loud.png";
  speaker_icon.src = "/../icons/icons_pas/megaphone_50x50px_fat.svg";
  speaker_icon.classList.add("speaker_icon");
  speaker_icon.classList.add("information_icon");
  icon_area.classList.add("icon_area");

  outer.id = userName;
  mute_icon.id = userName + "_mute_icon"
  speaker_icon.id = userName + "_speaker_icon"



  if(local) outer.classList.add("local");

  if (userAvatarURL == null || userAvatarURL == "no avatar support") {

    const avatarGenerator = new AvatarGenerator(userName);
    userAvatarURL = avatarGenerator.generateURLFromOptions();
  }

  img.src = userAvatarURL
  storeLocalUserBubbleSize(outer);

  return outer;
}

//Somewhat ugly, stores the size of a userbubble on screen
function storeLocalUserBubbleSize(element) {
  if(fixedUserBubbleHeight == null) {
    let bb = element.getBoundingClientRect();
    fixedUserBubbleWidth = bb.width;
    fixedUserBubbleHeight = bb.height;
  }
}

function shortenForDisplay( name, limit = 25 ) {

  if( name.length > limit ) {

    return name.substring( 0, limit - 3 ) + "...";
  }

  return name;
}

function showMuteIconForUser(username) {
  var mute_icon = document.getElementById(username + "_mute_icon");
  if (mute_icon) {
    mute_icon.classList.add("icon_active")
  } else {
    console.err("trying to show mute icon for non-existing userbubbleview")
  }
}

function hideMuteIconForUser(username) {
  var mute_icon = document.getElementById(username + "_mute_icon");
  if (mute_icon) {
    mute_icon.classList.remove("icon_active")
  } else {
    console.err("trying to hide mute icon for non-existing userbubbleview")
  }
}

function showSpeakerIconForUser(username) {
  var speaker_icon = document.getElementById(username + "_speaker_icon");
  if (speaker_icon) {
    speaker_icon.classList.add("icon_active")
  } else {
    console.err("trying to show speaker icon for non-existing userbubbleview")
  }
}

function hideSpeakerIconForUser(username) {
  var speaker_icon = document.getElementById(username + "_speaker_icon");
  if (speaker_icon) {
    speaker_icon.classList.remove("icon_active")
  } else {
    console.err("trying to hide speaker icon for non-existing userbubbleview")
  }
}