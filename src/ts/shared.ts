const sharedState: {
  playlist?: any,
  song?: any
} = {};


function setPlaylist(p) {
  sharedState.playlist = p;
}

function getPlaylist() {
  return sharedState.playlist;
}


function setSong(s) {
  sharedState.song = s;
}

function getSong() {
  return sharedState.song;
}


export {
  setPlaylist,
  getPlaylist,
  setSong, 
  getSong
}