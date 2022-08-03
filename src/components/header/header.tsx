import Taro from '@tarojs/taro';
import { Component } from 'react'

import './header.scss';


interface HeaderProps {
  isIndex?: boolean,
  background?: string,
  title: string,
  theme?: 'light' | 'dark'
}


class WXHeader extends Component<HeaderProps>{
  rect: Taro.getMenuButtonBoundingClientRect.Rect;
  constructor(props: HeaderProps) {
    super(props)
    const { windowWidth } = Taro.getSystemInfoSync()
    console.log(Taro.getSystemInfoSync())
    this.rect = Taro.getMenuButtonBoundingClientRect();
    this.rect.right = windowWidth - this.rect.right;
  }
  render() {
    const wrapperStyle = {
      paddingTop: this.rect.top,
      paddingLeft: this.rect.right,
      paddingRight: this.rect.right,
      paddingBottom: this.rect.right + 10,
      height: this.rect.height
    }
    const headerStyle = {
      background: this.props.background || '',
      paddingTop: this.rect.top,
      paddingLeft: this.rect.right,
      paddingRight: this.rect.right,
      paddingBottom: this.rect.right + 10,
      height: this.rect.height + this.rect.right + this.rect.top + 10
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
        <div className="wx-header" style={headerStyle}>
          {!this.props.isIndex ? (<div className={"capsule" + (this.props.theme === 'dark' ? ' dark' : '')} style={capsuleStyle}>
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