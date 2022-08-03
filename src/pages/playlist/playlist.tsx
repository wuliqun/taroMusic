import { Component } from 'react'
import Taro from '@tarojs/taro';
import { getPlaylist } from '../../ts/shared';

import './playlist.scss'

interface PlaylistState {
  playlist:any,
  id:number
}


export default class Playlist extends Component<any,PlaylistState> {
  constructor(props){
    super(props);
    this.state = {
      playlist:getPlaylist() || JSON.parse(Taro.getStorageSync('PLAYLIST') || '{}'),
      id:Number(Taro.getCurrentInstance().router?.params.id) || 3779629
    }
    console.log(JSON.parse(Taro.getStorageSync('PLAYLIST') || '{}'))
  }
  render() {
    return (
      <div className='p-playlist' style={{backgroundImage:`url(${this.state.playlist.coverImgUrl})`}}>
        {/* <div className="id">{ this.state.id }</div>
        { JSON.stringify(this.state.playlist) } */}
      </div>
    )
  }
}
