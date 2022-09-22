export interface IOptions {
  autoDope: boolean;
  confetti: boolean;
  hideLightbulbs: boolean;
  moveVibeMeter: boolean;
}

export enum SocketMessages {
  addOneTimeAnimation = "addOneTimeAnimation",
  takeDjSeat = "takeDjSeat",
  leaveDjSeat = "leaveDjSeat",
  skipDjTrack = "skipDjTrack",
  userWasDisconnected = "userWasDisconnected",
  addAvatarToDancefloor = "addAvatarToDancefloor",
  sendNextTrackToPlay = "sendNextTrackToPlay",
  notAuthorizedAction = "notAuthorizedAction",
  playNextSong = "playNextSong",
  provideCrossPlatformInfoForSong = "provideCrossPlatformInfoForSong",
  sendInitState = "sendInitState",
  sendInitialState = "sendInitialState",
  sendSatisfaction = "sendSatisfaction",
  startConnection = "startConnection",
  updateRoomConfig = "updateRoomConfig",
  userConnectionLost = "userConnectionLost",
  userDisconnected = "user:disconnected",
  userWasKickedFromRoom = "userWasKickedFromRoom",
  wrongMessagePayload = "wrongMessagePayload",
  roomIsRestarting = "roomIsRestarting",
}
