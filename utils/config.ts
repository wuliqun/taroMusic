import Taro from "@tarojs/taro";

interface ApiConfig {
  [devEnv:string]:{
    [clientEnv:string|number]:{
      apiUrl:string
    }
  }
}

const apiConfig:ApiConfig = {
  development: {
    [Taro.ENV_TYPE.WEB]:{      
      apiUrl: "http://45.32.122.79:3000/"
    },
    default:{
      apiUrl: "https://www.mu3c.xyz/api/"
    }
  },
  production: {
    [Taro.ENV_TYPE.WEB]:{
      apiUrl: "http://45.32.122.79:3000/"
    },
    default:{
      apiUrl: "https://www.mu3c.xyz/api/"
    }
  }
};


const devEnv:string = process.env.NODE_ENV!;
const clientEnv = Taro.getEnv();

// 调试模式, 打印接口请求及返回值
const IS_DEBUG:boolean = devEnv === 'development';


const APIURL:string = apiConfig[devEnv][clientEnv] ? apiConfig[devEnv][clientEnv].apiUrl : apiConfig[devEnv]['default'].apiUrl;

export{
  IS_DEBUG,
  APIURL
}