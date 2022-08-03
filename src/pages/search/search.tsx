import { Component, createRef, RefObject } from 'react'
import { ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro';
import { apiGetHotSearch, apiGetSearchTips, apiGetSearchSongs } from 'API/index';
import './search.scss'

interface SearchState {
  searchTxt: string,
  hotSearch: any[],
  searchTips: any[],
  history: string[],
  songs: any[],
  searchType: 0 | 1 | 2, // 0 默认 1 搜索中 2 搜索完成
  finished: boolean,
  scrollHeight: number
}

const SEARCH_HISTORY_STORAGE_KEY = 'SEARCH_HISTORY';

export default class Search extends Component<any, SearchState> {
  input: RefObject<HTMLInputElement>;
  timer: number = 0;
  constructor(props) {
    super(props);
    this.state = {
      searchTxt: "",
      hotSearch: [],
      searchTips: [],
      songs: [],
      searchType: 0,
      finished: false,
      scrollHeight: 500,
      history: JSON.parse(localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY) || '[]')
    }
    this.input = createRef<HTMLInputElement>();
    this.getHotSearch();
  }

  componentDidMount() {
    this.focus();

    this.getResultScrollHeight();
  }
  // 获取交点
  focus() {
    this.input.current?.focus();
  }
  // 获取结果列表滚动高度
  getResultScrollHeight() {
    // getCompRectByClassName
    const { windowHeight } = Taro.getSystemInfoSync()
    Taro.createSelectorQuery().select('.m-search').boundingClientRect(rec => {
      this.setState({
        scrollHeight: windowHeight - rec.height
      })
    }).exec();
  }
  clear() {
    // 搜索中  阻止清空
    if(this.state.searchType === 1) return ;
    this.setState({
      searchTxt: '',
      searchTips: [],
      songs: [],
      searchType: 0,
      finished: false
    });
  }
  handleChange(v) {
    // 重置
    this.setState({ searchTxt: v, searchType: 0, songs: [], finished: false });
    this.getSearchTips();
  }
  /**
   * 历史记录操作
   * @param type 'ADD'-添加 'DEL'-删除 'CLEAR'-清空
   * @param param ADD 时为添加的字符串   删除时表示下标或字符串
   */
  handleHistory(type: 'ADD' | 'DEL' | 'CLEAR', param?: number | string) {
    let history = this.state.history;
    switch (type) {
      case 'ADD':
        if (typeof param === 'string') {
          let index: number = -1;
          if ((index = history.indexOf(param)) !== -1) {
            history.splice(index, 1);
          }
          history.unshift(param);
        }
        break;
      case 'DEL':
        if (typeof param === 'number') {
          history.splice(param, 1);
        } else if (typeof param === 'string') {
          let index: number = -1;
          if ((index = history.indexOf(param)) !== -1) {
            history.splice(index, 1);
          }
        }
        break;
      case 'CLEAR':
        history = []
        break;
    }
    this.setState({
      history
    })
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  }
  submitSearch(keyword: string) {
    this.handleHistory('ADD', keyword);
    this.search(keyword)
  }
  search(keyword: string) {
    if (this.state.searchType === 1) return;

    this.setState({
      searchType: 1,
      searchTxt: keyword
    })
    this.input.current?.blur();
    if (!this.state.finished) {
      let songs = this.state.songs;
      let songIds = songs.map(s => s.id);
      apiGetSearchSongs(keyword, songs.length).then(res => {
        // 状态已变更, 丢弃结果
        if(this.state.searchType !== 1) return ;

        if (res.result.songs) {
          songs = songs.concat(res.result.songs.filter(song => songIds.indexOf(song.id) === -1))
          this.setState({
            finished: !res.result.hasMore,
            songs,
            searchType: 2
          })
        } else {
          this.setState({
            finished: true,
            searchType: 2
          })
        }
      });
    } else {
      this.setState({
        searchType: 2
      })
    }
  }
  getSearchTips() {
    this.setState({
      searchTips: []
    })
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      if (!this.state.searchTxt) return;
      apiGetSearchTips(this.state.searchTxt).then(res => {
        this.setState({
          searchTips: res.result.allMatch || []
        })
      });
    }, 200);
  }
  getHotSearch() {
    apiGetHotSearch().then(res => {
      this.setState({
        hotSearch: res.data
      });
    })
  }
  // 搜索提示
  renderSearchTips() {
    if (this.state.searchTxt && this.state.searchType === 0) {
      return (
        <div className="search-tips">
          <div className="title-txt" onClick={() => this.submitSearch(this.state.searchTxt)}>搜索"{this.state.searchTxt}"</div>
          <div className="tip-list">
            {this.state.searchTips.map(tip => {
              return (
                <div className="tip-item" onClick={() => this.submitSearch(tip.keyword)} key={tip.keyword}>
                  <div className="search-ico"></div>
                  <div className="txt">{tip.keyword}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null;
  }
  // 搜索结果
  renderSongs() {
    if (this.state.searchType >= 1) {
      return (
        <ScrollView className="search-result" style={{ height: this.state.scrollHeight }} scrollY lowerThreshold={20} onScrollToLower={() => {
          this.search(this.state.searchTxt)
        }}>
          <div className="songs">
            {this.state.songs.map(song => {
              return (<div className="song-item" key={song.id}>
                <div className="song">
                  <div className="name f-thide">{this.renderSearchText(song.name)}</div>
                  <div className="info">
                    <div className="sq"></div>
                    <div className="info-txt f-thide">{this.renderSearchText(song.artists.map(a => a.name).join('/') + " - " + song.album.name)}</div>
                  </div>
                </div>
                <div className="play"></div>
              </div>)
            })}
          </div>
          {this.renderLoading()}
        </ScrollView>
      )
    } else {
      return null;
    }
  }
  // 搜索高亮
  renderSearchText(txt: string) {
    let arr = txt.split(this.state.searchTxt);
    let res = [<em className="txt" key="0">{arr[0]}</em>];
    for (let i = 1; i < arr.length; i++) {
      res.push(<em className='txt em' key={i + '1'}>{this.state.searchTxt}</em>)
      res.push(<em className="txt" key={i}>{arr[i]}</em>)
    }
    return res;
  }
  // 加载中
  renderLoading() {
    if (this.state.finished) {
      return null;
    } else {
      return (
        <div className="loading">
          {this.state.searchType === 1 ? <div className="loading-icon bg-fit"></div> : null}
        </div>
      )
    }
  }
  // 历史记录
  renderHistory() {
    if (!this.state.searchTxt && this.state.history.length > 0 && this.state.searchType === 0) {
      return (
        <div className="history">
          <div className="title-wrapper">
            <div className="title">历史记录</div>
            <div className="ico-del bg-fit" onClick={() => { this.handleHistory('CLEAR') }} ></div>
          </div>
          <div className="history-list">
            {this.state.history.map(txt => {
              return (
                <div className="history-item f-thide" key={txt} onClick={() => { this.submitSearch(txt) }}>{txt}</div>
              )
            })}
          </div>
        </div>
      )
    } else {
      return null;
    }
  }

  // 热门 搜索
  renderHotSearch() {
    if (!this.state.searchTxt && this.state.hotSearch.length > 0 && this.state.searchType === 0) {
      return (
        <div className="hot-search">
          <div className="title">热搜榜</div>
          <div className="search-list">
            {this.state.hotSearch.map((search, index) => {
              return (
                <div className="search-item" onClick={() => this.submitSearch(search.searchWord)} key={search.searchWord}>
                  <div className={`order ${index < 3 ? 'order-hot' : ''}`}>{index + 1}</div>
                  <div className="info">
                    <div className="name f-thide">{search.searchWord}</div>
                    {search.alg === "featured" ? <div className="tip f-thide">{search.content}</div> : null}
                  </div>
                  <div className="score">{search.score}</div>
                </div>
              )
            })}
          </div>
        </div>
      );
    }
    return null;
  }
  render() {
    return (
      <div className="p-search">
        <div className="search-wrapper">
          <div className="m-search">
            <div className="content">
              <div className="search-ico"></div>
              <input type="text" className='input' ref={this.input} value={this.state.searchTxt}
                onChange={(e) => this.handleChange(e.target.value)} placeholder='搜索歌曲' onSubmit={() => this.submitSearch(this.state.searchTxt)} />
              {this.state.searchTxt ? (
                <div className="clear" onClick={() => this.clear()}></div>
              ) : null}
            </div>
            {this.renderSearchTips()}
          </div>
        </div>
        {this.renderHistory()}
        {this.renderHotSearch()}
        {this.renderSongs()}
      </div>
    )
  }
}
