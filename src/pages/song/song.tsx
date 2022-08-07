import { Component } from 'react'
import Taro from '@tarojs/taro';
import WXHeader from 'CMT/header/header';
import { apiGetSongPlayUrl, apiGetSimilarSongs, apiGetHotComments, apiGetSongLyric } from 'API/index';
import { getSong } from '../../ts/shared';

import './song.scss'

interface SongState {
  song: any,
  id: number,
  pageHeight: number,
  isPlaying: boolean,
  rotateDeg: number,
  similarSongs: any[],
  hotComments: any[],
  lyrics: { lyric: string, time: number }[],
  activeLyricIndex: number,
  lyricHeight: number
}

export default class Song extends Component<any, SongState>{
  timer = 0;
  static backgroundAudioManager = Taro.getBackgroundAudioManager();
  constructor(props) {
    super(props);
    const song = getSong() || JSON.parse(Taro.getStorageSync('SONG'))
    const { windowHeight } = Taro.getSystemInfoSync();
    Song.backgroundAudioManager.stop();
    this.state = {
      song: song,
      id: Number(Taro.getCurrentInstance().router?.params.id) || song.id,
      pageHeight: windowHeight,
      isPlaying: true,
      rotateDeg: 0,
      similarSongs: [],
      hotComments: [],
      lyrics: [],
      activeLyricIndex: 0,
      lyricHeight: 0
    }
    this.initPlayer();
    this.getSimilarSongs();
    this.getHotComments();
    this.getSongLyric();
    Taro.setStorageSync('SONG', JSON.stringify(song))
  }
  componentDidMount() {
    setTimeout(() => {
      Taro.createSelectorQuery().select('.lyric').boundingClientRect().exec(([rec]) => {
        if (rec) {
          this.setState({
            lyricHeight: rec.height / 3
          })
        }
      });
    }, 20);
  }
  initPlayer() {
    const { song } = this.state;
    Song.backgroundAudioManager.title = song.name;
    Song.backgroundAudioManager.epname = song.name;
    Song.backgroundAudioManager.singer = song.ar.map(ar => ar.name).join('/');
    Song.backgroundAudioManager.coverImgUrl = song.al.picUrl;
    Song.backgroundAudioManager.onPause(() => {
      this.togglePlay(false);
    });
    Song.backgroundAudioManager.onStop(() => {
      this.togglePlay(false);
    });
    Song.backgroundAudioManager.onPlay(() => {
      this.togglePlay(true);
    });
    Song.backgroundAudioManager.onEnded(()=>{
      this.togglePlay(false);
    })
    apiGetSongPlayUrl(song.id).then(url => {
      Song.backgroundAudioManager.src = url;
    }, err => {
      Taro.showToast({
        title: err,
        icon: 'error',
        duration: 2000
      })
    })
  }
  getSimilarSongs() {
    apiGetSimilarSongs(this.state.song.id).then(res => {
      this.setState({
        similarSongs: res.songs
      })
    })
  }
  getHotComments() {
    apiGetHotComments(this.state.song.id).then(res => {
      this.setState({
        hotComments: res.hotComments
      })
    })
  }
  getSongLyric() {
    apiGetSongLyric(this.state.song.id).then(res => {
      const lyricTxt = res.lrc.lyric;
      const reg = /\s*\[((\d+:)+\d{2}\.\d{1,3})\]\s*/;
      const lyricArr = lyricTxt.split('\n').filter(lyricLine => reg.test(lyricLine)).map(lyricLine => {
        const match = lyricLine.match(reg);
        let timeArr: string[] = [], time = 0;
        if (match) {
          timeArr = match[1].split('.');
          time += Number((timeArr[1] + '000').slice(0, 3));
          timeArr = timeArr[0].split(':');
          let x = 1;
          for (let i = timeArr.length - 1; i >= 0; i--) {
            time += Number(timeArr[i]) * 1000 * x;
            x *= 60
          }
        }
        return {
          lyric: lyricLine.replace(reg, ''),
          time
        }
      });
      this.setState({
        lyrics: lyricArr
      })
    })
  }
  // 切换播放
  togglePlay(flag?: boolean) {
    if (typeof flag !== 'boolean') {
      flag = !this.state.isPlaying;
    }
    if (!flag) {
      Song.backgroundAudioManager.pause();
      this.stopDiscAnimation();
    } else {
      Song.backgroundAudioManager.play();
      this.discAnimation();
    }
    this.setState({
      isPlaying: flag
    })
  }
  // disc 动画切换
  discAnimation() {
    this.timer = window.requestAnimationFrame(() => {
      const { rotateDeg, activeLyricIndex, lyrics } = this.state;
      const current = Math.round(Song.backgroundAudioManager.currentTime * 1000);
      let i: number = 0;
      for (i = activeLyricIndex; i < lyrics.length; i++) {
        if (i === lyrics.length - 1 || current < lyrics[i].time || (current >= lyrics[i].time && current < lyrics[i + 1].time)) {
          break;
        }
      }
      this.setState({
        rotateDeg: (rotateDeg + .3) % 360,
        activeLyricIndex: i
      });
      this.discAnimation();
    })
  }
  stopDiscAnimation() {
    window.cancelAnimationFrame(this.timer)
  }
  resetDiscAnimation() {
    this.stopDiscAnimation();
    this.setState({
      rotateDeg: 0
    })
  }

  // 碟盘
  renderDisc() {
    const { song, isPlaying, rotateDeg } = this.state;
    // disc旋转
    const discRotateStyle = {
      transform: `rotate(${rotateDeg}deg)`
    };
    return (
      <div className="disc-wrapper">
        <div className="logo bg-fit"></div>
        <div className={"needle bg-fit" + (isPlaying ? ' playing' : '')}></div>
        <div className={"play bg-fit" + (isPlaying ? ' playing' : '')} onClick={() => this.togglePlay()}></div>
        <div className="disc bg-fit" style={discRotateStyle}>
          <div className="song-img bg-fit" style={{ backgroundImage: `url(${song.al.picUrl})` }}>
          </div>
        </div>
      </div>
    )
  }

  // 歌词
  renderLyric() {
    const { lyrics, activeLyricIndex, lyricHeight } = this.state;
    let lyricScrollStyle: any = null;
    if (activeLyricIndex > 1) {
      lyricScrollStyle = {
        marginTop: - (activeLyricIndex - 1) * lyricHeight
      }
    }
    return (
      <div className="lyric">
        <div className="lyric-scroller" style={lyricScrollStyle}>
          {lyrics.map((lyric, index) => {
            return (
              <div className="line">
                <div className={"line-txt" + (activeLyricIndex === index ? ' active' : '')}>{lyric.lyric}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  // 相似推荐
  renderSimilar() {
    const { similarSongs } = this.state;
    if (!similarSongs.length) {
      return null;
    } else {
      return (
        <div className="similar">
          <div className="title-wrapper">
            <div className="title">喜欢这首歌的人也听</div>
            <div className="play-all">
              <div className="icon bg-fit"></div>
              <div>一键收听</div>
            </div>
          </div>
          <div className="similar-list">
            {similarSongs.map(song => {
              return (
                <div className="song-item" key={song.id}>
                  <img className='img' src={song.album.picUrl} alt="" />
                  <div className="info">
                    <div className="name f-thide">{song.name}</div>
                    <div className="singer">
                      <div className="sq bg-fit"></div>
                      <div className="txt f-thide">{song.artists.map(a => a.name).join('/') + " - " + song.album.name}</div>
                    </div>
                  </div>
                  <div className="play bg-fit"></div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  // 评论
  renderComments() {
    const { hotComments } = this.state;
    if (!hotComments.length) {
      return null;
    } else {
      return (
        <div className="comments">
          <div className="title">精彩评论</div>
          <div className="comment-list">
            {hotComments.map(comment => {
              return (
                <div className="comment-item" key={comment.commentId}>
                  <div className="user">
                    <img src={comment.user.avatarUrl} alt="" className="avatar" />
                    <div className="info">
                      <div className="name">{comment.user.nickname}</div>
                      <div className="time">{comment.timeStr}</div>
                    </div>
                    <div className="like">
                      <div className="icon bg-fit"></div>
                      <div>{comment.likedCount}</div>
                    </div>
                  </div>
                  <div className="content">{comment.content}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  render() {
    const { song } = this.state;

    // 页面背景
    const bg = `center -3000px / 500% 9000px  no-repeat url(${song.al.picUrl + '?imageView&blur=40x20'})`;


    return (
      <div className="p-song" style={{ background: '#161824', height: this.state.pageHeight }}>
        <div className="p-song-content">
          <WXHeader title={song.name} theme={"dark"} background={'#161824'} innerBackground={bg}></WXHeader>
          {this.renderDisc()}
          {this.renderLyric()}
          <div className="share-wrapper">
            <div className="more">在网易云音乐查看更多歌词</div>
            <div className="share">分享给微信好友</div>
          </div>
          {this.renderSimilar()}
          {this.renderComments()}
        </div>
        <div className="p-song-bg" style={{ background: bg }}></div>
      </div>
    )
  }
}