import { Component } from 'react'
import Taro from '@tarojs/taro';
import { getPlaylist } from '../../ts/shared';
import WXHeader from 'CMT/header/header';

import './playlist.scss'
import { formatNum } from 'UTILS/utils';
import { apiGetUserInfo } from 'API/index';

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
      playlist: getPlaylist(),
      id: Number(Taro.getCurrentInstance().router?.params.id),
      user: null,
      headerHeight: 0,
      titleTop: 0,
      fixTitle: false
    }
    this.getPlaylistUser();
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
          <div className="title" style={titleStyle}>
            <div className="play-icon bg-fit"></div>
            <div className="txt">播放全部</div>
            <div className="desc">（共{playlist.trackCount}首）</div>
          </div>
        </div>
        <div className="song-list">
          {tracks.map((song, index) => {
            return (
              <div className="song-item" key={song.id}>
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
          <div className="img bg-fit" style={{ backgroundImage: `url(${playlist.coverImgUrl})` }}>
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
    const bg = `center 0 / 100% 5000px no-repeat url(${this.state.playlist.coverImgUrl})`;
    return (
      <div className='p-playlist' style={{ background: bg }}>
        <WXHeader title={title} background={bg} theme={"dark"} barHeight={(height)=>{
          this.setState({
            headerHeight:height
          })
        }}></WXHeader>
        {this.renderPlaylist()}
        {this.renderSongs()}
      </div>
    )
  }
}

