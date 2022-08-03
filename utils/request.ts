import Taro from '@tarojs/taro';
import { IS_DEBUG, APIURL } from './config';


// 输出样式控制
const COMMON_STYLE = 'padding: 0 6px;color:#fff;border-radius: 4px;'
const ERR_STYLE = COMMON_STYLE + 'background-color:red;'
const SEND_STYLE = COMMON_STYLE + 'background-color:#FF9966;'
const RECEIVE_STYLE = COMMON_STYLE + 'background-color:#66CC00;'


interface RequestOptions {
  url: string,
  method?: 'POST' | 'GET',
  data?: object,
  clearCache?: boolean, // 不要缓存
}


/**
 * @params options 
 * {
 *    url:'',
 *    data:{},
 *    clearCache?:boolean, // POST默认缓存,不要缓存指定false
 * }
 */
export default (options: RequestOptions): Promise<any> => {
  if (IS_DEBUG) {
    console.log(`%crequest ${options.url}, params: \n`, SEND_STYLE, options.data);
  }
  let url = options.url;
  if (!/^https?/.test(url)) {
    if (/^\//.test(url)) {
      url = url.slice(1);
    }
    url = APIURL + url;
  }
  return Taro.request({
    url,
    method: options.method || 'GET',
    data: options.clearCache ?
      Object.assign({}, options.data, { timestamp: Date.now() })
      : (options.data || {}),
    credentials: 'include'
  }).then(res => {
    if (res.statusCode === 200) {
      if (IS_DEBUG) {
        console.log(`%crequest ${options.url}, success: \n`, RECEIVE_STYLE, res.data);
      }
      return res.data;
    } else {
      if (IS_DEBUG) {
        console.log(`%crequest ${options.url}, error, statusCode ${res.statusCode}: \n`, ERR_STYLE, res.errMsg);
      }
      throw res;
    }
  }, err => {
    if (IS_DEBUG) {
      console.log(`%crequest ${options.url}, error: \n`, ERR_STYLE, err);
    }
    throw err;
  })
}