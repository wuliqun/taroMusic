import { Component } from 'react'
import Taro from '@tarojs/taro';

import './index.scss'
import { apiGetToplist, apiGetPlaylistDetail } from 'API/index'

interface IndexState {
  topList: any[]
}
// 展示热榜歌单数量
const count = 4;

export default class Index extends Component<any, IndexState> {
  constructor(props) {
    super(props);
    this.state = {
      topList: []
    }
    this.getTopList()
  }
  getTopList() {
    apiGetToplist().then(res => {
      this.setState({
        topList: res.list.slice(0, count)
      });
      for (let i = 0; i < Math.min(count, res.list.length); i++) {
        this.getPlaylistTracks(res.list[i].id, i);
      }
    })
  }
  getPlaylistTracks(id: number, index: number) {
    apiGetPlaylistDetail(id).then(res => {
      let topList = this.state.topList;
      topList[index].tracks = res.playlist.tracks;
      this.setState({
        topList: topList
      });
    })
  }
  renderListItem(playlist) {
    const bgImg = {
      backgroundImage: `url(${playlist.coverImgUrl})`
    }
    let songs: JSX.Element[] | null = null;
    if (playlist.tracks) {
      songs = playlist.tracks.slice(0, 3).map((song, index) => {
        return (<div className="song f-thide" key={song.id}>{index + 1}.{song.name} - {song.ar.map(ar => ar.name).join('/')}</div>)
      })
    }
    return (<div className="list-item" key={playlist.id}>
      <div className="img" style={bgImg}>
        <div className="name">{playlist.name}</div>
        <div className="update">{playlist.updateFrequency}</div>
      </div>
      <div className="songs">
        {songs}
      </div>
    </div>)
  }

  render() {
    return (
      <div className='p-index'>
        <div className="m-search" onClick={() => {
          Taro.navigateTo({
            url: '/pages/search/search'
          })
        }}>
          <div className="search-ico"></div>
          <div className="txt">搜索歌曲</div>
        </div>
        <div className="toplist">
          {this.state.topList.map(playlist => this.renderListItem(playlist))}
        </div>
      </div>
    )
  }
}
