const APP_ID = "858941ba83074145afc152e279ec7ace";
const TOKEN =
  "007eJxTYPCfUFJay7z4raaCzQfPpQWV7Ndy9364e/T4q1yhmWH/j7cqMFiYWliaGCYlWhgbmJsYmpgmpiUbmhqlGplbpiabJyan2s1TT20IZGRoazrHysgAgSA+B0NwRmpRTn5yNgMDAB9bIi0=";
const CHANNEL = "Sherlock";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Joining and leaving of people

let localTracks = [];
let remoteUsers = [];

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};

let joinAndDisplayLocalStream = async () => {
  console.log("Hello");
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);
  let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

  let player = `<div class="video-container" id="user-container-${UID}">
  <div class="video-player" id="user-${UID}"></div>
  </div>`;

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  localTracks[1].play(`user-${UID}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

document.getElementById("join-btn").addEventListener("click", joinStream);

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.id] = user;
  await client.subscribe(user, mediaType);
  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.id}`);
    if (player != null) {
      player.remove();
    }
    player = `<div class="video-container" id="user-container-${user.id}"><div class="video-player" id="user-${user.id}"></div></div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);
  }
  user.videoTrack.play(`user-${user.uid}`);
  if (mediaType === "audio") {
    user.autoTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.id];
  document.getElementById(`user-container-${user.id}`).remove();
};

// Ending stream and removing all

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }
  await client.leave();

  document.getElementById("join-btn").style.display = "block";
  document.getElementById("stream-controls").style.display = "none";
  document.getElementById("video-streams").innerHTML = "";
};

document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);

// Toggle mic

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.innerHTML = "Mic on";
    e.target.style.backgroundColor = "cadetblue";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerHTML = "Mic off";
    e.target.style.backgroundColor = "red";
  }
};

document.getElementById("mic-btn").addEventListener("click", toggleMic);

// Toggle camera

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Camera on";
    e.target.style.backgroundColor = "cadetblue";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "Camera off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
