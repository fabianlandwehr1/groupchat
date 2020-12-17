function initControls() {
  mutebutton = document.getElementById("mutebutton");
  mutebutton.onclick = muteChange;
  publicspeakerbutton = document.getElementById("publicspeakerbutton");
  publicspeakerbutton.onclick = publicSpeakerChange;
}

function muteChange() {
  if(isMuted) {
    disableMute();
  }
  else {
    enableMute();
  }
  updateMuteStatus(isMuted);
  myStream.getAudioTracks()[0].enabled = !isMuted;
}

function publicSpeakerChange() {
  if(isPublicSpeaker) {
    disablePublicSpeaker();
  }
  else {
    enablePublicSpeaker();
  }
  updateSpeakerStatus(isPublicSpeaker);
}

function enablePublicSpeaker() {
  //publicspeakerbutton.getElementsByTagName("img")[0].src = "icons/megaphone_loud.png";
  publicspeakerbutton.getElementsByTagName("img")[0].src = "icons/icons_pas/megaphone_50x50px.svg";
  publicspeakerbutton.querySelector('.tooltip').innerHTML = "Be Quiet";
  publicspeakerbutton.classList.add("toggledinteractivebutton");
  isPublicSpeaker = true;
  showSpeakerIconForUser(USERNAME)
}

function disablePublicSpeaker() {
  //publicspeakerbutton.getElementsByTagName("img")[0].src = "icons/megaphone_quiet.png";
  publicspeakerbutton.getElementsByTagName("img")[0].src = "icons/icons_pas/no_megaphone_50x50px.svg";
  publicspeakerbutton.querySelector('.tooltip').innerHTML = "Speak Up";
  publicspeakerbutton.classList.remove("toggledinteractivebutton");
  isPublicSpeaker = false;
  hideSpeakerIconForUser(USERNAME)
}

function enableMute() {
  //mutebutton.getElementsByTagName("img")[0].src = "icons/microphone_mute.png";
  mutebutton.getElementsByTagName("img")[0].src = "icons/icons_pas/no_mic_50x50px.svg";
  mutebutton.querySelector('.tooltip').innerHTML = "Unmute Yourself";
  mutebutton.classList.add("toggledinteractivebutton");
  isMuted = true;
  showMuteIconForUser(USERNAME);
}

function disableMute() {
  //mutebutton.getElementsByTagName("img")[0].src = "icons/microphone.png";
  mutebutton.getElementsByTagName("img")[0].src = "icons/icons_pas/mic_50x50px.svg";
  mutebutton.classList.remove("toggledinteractivebutton");
  mutebutton.querySelector('.tooltip').innerHTML = "Mute Yourself";
  isMuted = false;
  hideMuteIconForUser(USERNAME);
}

function disableLocalUserControls() {
  console.log("disable local user controlls")
  document.getElementById("controlpanel").classList.add("inactive")
}

function enableLocalUserControls() {
  console.log("enable local user controlls")
  document.getElementById("controlpanel").classList.remove("inactive")
}
