import { Component } from 'react'
import Taro from '@tarojs/taro';
import { addPlayingList } from 'SLICE/music';
import WXHeader from 'CMT/header/header';

import './playlist.scss'
import { formatNum } from 'UTILS/utils';
import { apiGetUserInfo } from 'API/index';
import store from 'STORE/index';


interface PlaylistState {
  playlist: any,
  id: number,
  user: any,
  headerHeight: number,
  titleTop: number,
  fixTitle: boolean
}

const title = '歌单';
export default class Playlist extends Component<any, PlaylistState> {
  constructor(props) {
    super(props);
    this.state = {
      playlist: this.getPlaylist(),
      id: Number(Taro.getCurrentInstance().router?.params.id),
      user: null,
      headerHeight: 0,
      titleTop: 0,
      fixTitle: false
    }
    this.getPlaylistUser();
  }
  getPlaylist(){
    const state = store.getState().music;
    return state.playlist;
  }
  componentDidMount() {
    this.getTitleTop();
  }
  onPageScroll(e) {
    // this.setState({
    //   fixTitle:e.scrollTop + this.state.headerHeight > this.state.titleTop
    // })
  }
  getTitleTop() {
    Taro.createSelectorQuery().select('.title-wrapper').boundingClientRect().exec(
      ([rec]) => {
        rec && this.setState({
          titleTop: rec.top
        })
      }
    );
  }
  getPlaylistUser() {
    apiGetUserInfo(this.state.playlist.userId).then(res => {
      this.setState({
        user: res.profile
      })
    })
  }

  // 点就所歌曲 跳转
  playSong(song) {
    store.dispatch(addPlayingList(song));
    Taro.navigateTo({
      url: `/pages/song/song?id=${song.id}`
    });
  }
  // 全部播放
  playAll(){
    store.dispatch(addPlayingList(this.state.playlist.tracks));
    Taro.navigateTo({
      url: `/pages/song/song?id=${this.state.playlist.tracks[0].id}`
    });
  }
  renderSongs() {
    const { playlist, headerHeight, fixTitle } = this.state;
    let { tracks } = playlist;
    let titleStyle: any = null;
    if (fixTitle) {
      titleStyle = {
        position: 'fixed',
        left: 0,
        top: headerHeight,
        width: '100%'
      }
    }
    return (
      <div className="songs">
        <div className="title-wrapper">
          <div className="title" style={titleStyle} onClick={()=>this.playAll()}>
            <div className="play-icon bg-fit"></div>
            <div className="txt">播放全部</div>
            <div className="desc">（共{playlist.trackCount}首）</div>
          </div>
        </div>
        <div className="song-list">
          {tracks.map((song, index) => {
            return (
              <div className="song-item" key={song.id} onClick={() => this.playSong(song)}>
                <div className="order">{index + 1}</div>
                <div className="info">
                  <div className="name f-thide">{song.name}</div>
                  <div className="desc">
                    <div className="sq"></div>
                    <div className="desc-txt f-thide">{song.ar.map(a => a.name).join('/') + " - " + song.al.name}</div>
                  </div>
                </div>
                <div className="play-btn bg-fit"></div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  renderPlaylist() {
    const { user, playlist } = this.state;
    return (
      <div className="playlist">
        <div className="detail">
          <div className="img bg-fit" style={{ backgroundImage: `url(${playlist.coverImgUrl}?param=400y400)`}}>
            <div className="count">
              <div className="icon bg-fit"></div>
              <div className="num">{formatNum(playlist.playCount)}</div>
            </div>
          </div>
          <div className="info">
            <div className="name f-thide">{playlist.name}</div>
            {user ? (<div className="user">
              <div className="avatar">
                <img className="avatar-img" src={user.avatarUrl} alt="" />
              </div>
              <div className="user-name">{user.artistName}</div>
            </div>) : (<div className="user"></div>)}
            <div className="desc">{playlist.description}</div>
          </div>
        </div>
        <div className="share-wrapper">
          <div className="share">
            <div className="icon bg-fit"></div>
            <div className="txt">分享给微信好友</div>
          </div>
        </div>
      </div>
    )
  }
  render() {
    const bg = `center 0 / 100% 5000px no-repeat url(${this.state.playlist.coverImgUrl}?param=400y400)`;
    return (
      <div className='p-playlist' style={{ background: bg }}>
        <WXHeader title={title} background={bg} theme={"dark"} barHeight={(height) => {
          this.setState({
            headerHeight: height
          })
        }}></WXHeader>
        {this.renderPlaylist()}
        {this.renderSongs()}
      </div>
    )
  }
}

