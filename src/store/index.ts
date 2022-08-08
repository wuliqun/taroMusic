import {configureStore} from '@reduxjs/toolkit'
import musicSlice from './slice/music';

export default configureStore({
  reducer:{
    music:musicSlice
  }
})