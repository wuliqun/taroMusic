import Taro from '@tarojs/taro';
import { Component } from 'react'

import './header.scss';


interface HeaderProps {
  isIndex?: boolean,
  background?: string,
  title: string,
  theme?: 'light' | 'dark',
  barHeight?:(height:number)=>void
}


class WXHeader extends Component<HeaderProps>{
  rect: Taro.getMenuButtonBoundingClientRect.Rect;
  unSupport: boolean = false;
  constructor(props: HeaderProps) {
    super(props)
    const { windowWidth } = Taro.getSystemInfoSync()
    const rect:any = Taro.getMenuButtonBoundingClientRect();
    if(typeof rect.catch === 'function'){
      rect.catch(err=>{});
      this.unSupport = true;
    }else{
      rect.right = windowWidth - rect.right;
      this.rect = rect;
    }
  }
  componentDidMount(){
    // render(){ return null } 同样会触发
    Taro.createSelectorQuery().select('.wx-header').boundingClientRect().exec(([rec]) => {
      if(this.props.barHeight){
        this.props.barHeight(rec ? rec.height : 0);
      }
    });
  }
  render() {
    if (this.unSupport || !this.rect?.height) return null;
    const wrapperStyle = {
      paddingTop: this.rect.top,
      paddingLeft: this.rect.right,
      paddingRight: this.rect.right,
      paddingBottom: this.rect.right,
      height: this.rect.height
    }
    const headerStyle = {
      background: this.props.background || '',
      paddingTop: this.rect.top,
      paddingLeft: this.rect.right,
      paddingRight: this.rect.right,
      paddingBottom: this.rect.right + 10,
      height: this.rect.height + this.rect.right + this.rect.top
    }
    const capsuleStyle = {
      top: this.rect.top,
      left: this.rect.right,
      width: this.rect.width,
      height: this.rect.height,
      borderRadius: this.rect.height
    }
    const iconRect = {
      height: this.rect.height / 1.7,
      width: this.rect.height / 1.7,
    }
    return (
      <div className="wx-header-wrapper" style={wrapperStyle}>
        <div className={"wx-header" + (this.props.theme === 'dark' ? ' dark' : '')} style={headerStyle}>
          {!this.props.isIndex ? (<div className="capsule" style={capsuleStyle}>
            <div className="icon-wrapper" onClick={() => Taro.navigateBack()}>
              <div className="icon back" style={iconRect} ></div>
            </div>
            <div className="sep"></div>
            <div className="icon-wrapper" onClick={() => Taro.redirectTo({ url: '/pages/index/index' })}>
              <div className="icon home" style={iconRect} ></div>
            </div>
          </div>) : null}
          <div className="title" style={{ height: this.rect.height }}>{this.props.title}</div>
        </div>
      </div>
    )
  }
}


export default WXHeader;