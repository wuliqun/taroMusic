import Taro from '@tarojs/taro';
import { Component } from 'react'

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
    this.rect = Taro.getMenuButtonBoundingClientRect();
  }
  render() {
    const headerStyle = {
      paddingTop: this.rect.top,
      paddingLeft: this.rect.right,
      paddingRight: this.rect.right,
      paddingBottom: this.rect.right,
      background: this.props.background || ''
    }
    return (
      <div className="wx-header" style={headerStyle}>
        {this.props.isIndex ? (<div className={"capsule" + this.props.theme === 'dark' ? 'dark' : ''}>
          <div className="back"></div>
          <div className="sep"></div>
          <div className="home"></div>
        </div>) : null}
        <div className="title">{this.props.title}</div>
      </div>
    )
  }
}


export default WXHeader;