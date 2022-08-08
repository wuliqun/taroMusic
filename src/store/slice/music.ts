import { createSlice } from "@reduxjs/toolkit";

interface MusicState {
  playlist: any,
  playingList: any[],
  playingIndex: number,
  playingMode: number,   // 1 顺序播放 2 循环播放 3 随机播放
  ended: boolean
}
const initialState: MusicState = {
  playlist: null,
  playingList: [],
  playingIndex: 0,
  playingMode: 1,
  ended: false
};
export const musicSlice = createSlice({
  name: "music", // 命名空间，在调用action的时候会默认的设置为action的前缀,保证唯一.不重名
  initialState,
  reducers: {
    // reducer函数 state当前组件的数据 
    //第二个参数为{payload:{},type:"""} 想想就写法或者vuex
    setPlaylist(state, actions) {
      state.playlist = actions.payload;
    },
    setPlayingMode(state, actions) {
      state.playingMode = actions.payload;
    },
    addPlayingList(state, { payload }) {
      if (Array.isArray(payload)) {
        state.playingList = payload.concat(state.playingList);
      } else {
        state.playingList.unshift(payload);
      }
      state.playingIndex = 0;
      state.ended = false;
    },
    delPlayingList(state, { payload }) {
      if (typeof payload === 'number') {
        state.playingList.splice(payload, 1);
      } else {
        state.playingList = state.playingList.filter(p => p !== payload);
      }
    },
    restartPlayingList(state) {
      state.playingIndex = 0;
      state.ended = false;
    },
    nextPlayingList(state) {
      switch (state.playingMode) {
        case 1:
          if (state.playingIndex === state.playingList.length - 1) {
            state.ended = true;
          } else {
            state.playingIndex++;
          }
          break;
        case 2:
          state.playingIndex = (state.playingIndex + 1) % state.playingList.length;
          break;
        case 3:
          if (state.playingList.length === 1) {
            state.ended = true;
          }
          let index = Math.floor(Math.random() * (state.playingList.length - 1));
          if (index >= state.playingIndex) {
            index++;
          }
          state.playingIndex = index;
          break;
      }
    },
    clearPlayingList(state) {
      state.playingList = [];
    }
  },
});
export const { setPlaylist, setPlayingMode, addPlayingList, delPlayingList, restartPlayingList, nextPlayingList } = musicSlice.actions;
export const selectPlaylist = (state) => state.music.playlist;
export const selectPlayingMode = (state) => state.music.playingMode;
export const selectEnded = (state) => state.music.ended;
export const selectCurrentSong = (state) => state.music.playingList[state.playingIndex];

export default musicSlice.reducer;