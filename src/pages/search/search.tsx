import { Component, createRef, RefObject } from 'react'
import Taro from '@tarojs/taro';
import { apiGetHotSearch, apiGetSearchTips,apiGetSearchSongs } from 'API/index';
import './search.scss'

interface SearchState {
  searchTxt: string,
  hotSearch: any[],
  searchTips: any[],
  songs:any[],
  searchType: 0 | 1 | 2, // 0默认 1 搜索中 2 搜索完成
  finished:boolean
}
export default class Search extends Component<any, SearchState> {
  input: RefObject<HTMLInputElement>;
  timer: number = 0;
  constructor(props) {
    super(props);
    this.state = {
      searchTxt: "",
      hotSearch: [],
      searchTips: [],
      songs:[],
      searchType: 0,
      finished:false
    }
    this.input = createRef<HTMLInputElement>();
  }
  componentWillMount() {
    this.getHotSearch();
  }

  componentDidMount() {
    this.focus();
  }
  focus() {
    this.input.current?.focus();
  }
  clear() {
    this.setState({
      searchTxt: '',
      searchTips: [],
      searchType: 0,
      finished:false
    });
  }
  handleChange(v) {
    this.setState({ searchTxt: v,searchType:0,songs:[] });
    Taro.pageScrollTo({scrollTop:0})
    this.getSearchTips();
  }
  submitSearch(keyword?: string) {
    if (typeof keyword !== 'string') {
      keyword = this.state.searchTxt
    }    
    this.search(keyword)
  }
  search(keyword:string) {
    this.setState({
      searchType: 1,
      searchTxt:keyword
    })
    this.input.current?.blur();
    if(!this.state.finished){
      apiGetSearchSongs(keyword).then(res=>{
        let songs = this.state.songs.concat(res.result.songs)
        this.setState({
          finished:res.result.hasMore,
          songs,
          searchType:2
        })
      });
    }else{
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
          <div className="title-txt" onClick={() => this.submitSearch()}>搜索"{this.state.searchTxt}"</div>
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
  renderSongs(){
    if(this.state.searchType >= 1){
      return (
        <div className="search-result">
          <div className="songs">
            { this.state.songs.map(song=>{
              return (<div className="song-item" key={song.id}>
                <div className="song">
                  <div className="name">{this.renderSearchText(song.name)}</div>
                  <div className="info">
                    <div className="sq"></div>
                    <div>{this.renderSearchText(song.artists.map(a=>a.name).join('/') + " - " + song.album.name)}</div>
                  </div>
                </div>
                <a href="#!" className="play"></a>
              </div>)
            }) }
          </div>
          { this.state.searchType === 1 ? this.renderLoading() : null }
        </div>
      )
    }else{
      return null;
    }
  }
  // 搜索高亮
  renderSearchText(txt:string){
    let arr = txt.split(this.state.searchTxt);
    let res = [<em key="0">{arr[0]}</em>];
    for(let i = 1;i<arr.length;i++){
      res.push(<em className='em' key={i + '1'}>{this.state.searchTxt}</em>)
      res.push(<em key={i}>{arr[i]}</em>)
    }
    return res;
  }
  // 加载中
  renderLoading(){
    return (
      <div className="loading">
        {[1,2,3,4,5].map(num=>{
          return (
            <div className={`loading-bar loading-bar-${num}`} key={num}></div>
          )
        })}
      </div>
    )
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
                <div className="search-item" key={search.searchWord}>
                  <div className={`order ${index < 3 ? 'order-hot' : ''}`}>{index + 1}</div>
                  <div className="info">
                    <div className="name">{search.searchWord}</div>
                    {search.alg === "featured" ? <div className="tip">{search.content}</div> : null}
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
              <input type="text" ref={this.input} value={this.state.searchTxt}
                onChange={(e) => this.handleChange(e.target.value)} placeholder='搜索歌曲' onSubmit={() => this.submitSearch()} />
              {this.state.searchTxt ? (
                <div className="clear" onClick={() => this.clear()}></div>
              ) : null}
            </div>
            {this.renderSearchTips()}
          </div>
        </div>
        {this.renderHotSearch()}
        {this.renderSongs()}
      </div>
    )
  }
}