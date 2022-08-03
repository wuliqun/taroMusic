const apiConfig: {
  [k: string]: { apiUrl: string }
} = {
  development: {
    // apiUrl: "https://www.mu3c.xyz/api/"
    apiUrl: "http://www.mu3c.xyz:3000/"
  },
  production: {
    apiUrl: "https://www.mu3c.xyz/api/"
  }
};


const ENV:string = process.env.NODE_ENV!;

// 调试模式, 打印接口请求及返回值
const IS_DEBUG:boolean = ENV === 'development';


const APIURL:string = apiConfig[ENV].apiUrl;

export{
  IS_DEBUG,
  APIURL
}