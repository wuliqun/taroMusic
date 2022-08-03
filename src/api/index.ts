import request  from "UTILS/request";

// 获取热榜
export function apiGetToplist(){
  return request({
    url:'/toplist'
  })
}

// 获取推荐歌单
export function apiGetPlaylistDetail(id:number){
  return request({
    url:'/playlist/detail',
    data:{id}
  })
}



// 获取推荐歌单
export function apiGetHotSearch(){
  return request({
    url:'/search/hot/detail'
  })
}




// 获取搜索提示
export function apiGetSearchTips(keywords:string){
  return request({
    url:'/search/suggest',
    data:{
      keywords,
      type:'mobile'
    }
  })
}

// 歌曲搜索 
export function apiGetSearchSongs(keywords:string,offset:number = 0){
  return request({
    url:'/search',
    data:{
      keywords,
      type:1,
      offset
    }
  })
}