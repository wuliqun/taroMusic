import { Component } from 'react'
import Taro from '@tarojs/taro';
import './index.scss'
import { apiGetToplist, apiGetPlaylistDetail } from 'API/index'
import WXHeader from 'CMT/header/header';
import store from 'STORE/index';
import { setPlaylist } from 'SLICE/music';


interface IndexState {
  topList: any[]
}
// 展示热榜歌单数量
const count = 4;
const title = 'MOCK - 网易云音乐';

const INDEX_DATA_STORAGE_KEY = 'INDEX_PLAYLIST';
export default class Index extends Component<any, IndexState> {
  constructor(props) {
    super(props);
    this.state = {
      topList: JSON.parse(Taro.getStorageSync(INDEX_DATA_STORAGE_KEY) || '[]')
    }
    this.getTopList()
  }
  getTopList() {
    if(this.state.topList.length === 4) return;
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
      Taro.setStorageSync(INDEX_DATA_STORAGE_KEY,JSON.stringify(topList))
    })
    
  }
  gotoPlaylist(playlist){
    store.dispatch(setPlaylist(playlist));
    Taro.navigateTo({
      url: `/pages/playlist/playlist?id=${playlist.id}`
    });
  }
  renderListItem(playlist) {
    const bgImg = {
      backgroundImage: `url(${playlist.coverImgUrl}?param=400y400)`
    }
    let songs: JSX.Element[] | null = null;
    if (playlist.tracks) {
      songs = playlist.tracks.slice(0, 3).map((song, index) => {
        return (<div className="song f-thide" key={song.id}>{index + 1}.{song.name} - {song.ar.map(ar => ar.name).join('/')}</div>)
      })
    }
    return (<div className="list-item" key={playlist.id} onClick={()=>this.gotoPlaylist(playlist)}>
      <div className="img" style={bgImg}>
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
        <WXHeader title={ title } isIndex></WXHeader>
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
