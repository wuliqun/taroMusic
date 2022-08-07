import request  from "UTILS/request";

// 获取热榜
function apiGetToplist(){
  return request({
    url:'/toplist'
  })
}

// 获取推荐歌单
function apiGetPlaylistDetail(id:number){
  return request({
    url:'/playlist/detail',
    data:{id}
  })
}



// 获取推荐歌单
function apiGetHotSearch(){
  return request({
    url:'/search/hot/detail'
  })
}




// 获取搜索提示
function apiGetSearchTips(keywords:string){
  return request({
    url:'/search/suggest',
    data:{
      keywords,
      type:'mobile'
    }
  })
}

// 歌曲搜索 
function apiSearchSongs(keywords:string,offset:number = 0){
  return request({
    url:'/search',
    data:{
      keywords,
      type:1,
      offset
    }
  }).then(res=>{
    return request({
      url:'/song/detail',
      data:{
        ids:res.result.songs.map(song=>song.id).join(',')
      }
    }).then(res2=>{
      return {
        result:{
          songs:res2.songs,
          hasMore:res.result.hasMore
        }
      }
    })
  })
}

// 获取音乐播放链接
function apiGetSongPlayUrl(id){
  return request({
    url:'/song/url',
    data:{
      id
    }
  }).then(res=>{
    if(res.code === 200){
      return res.data[0].url;
    }else{
      throw "获取播放链接失败 ~";
    }
  })
}

// 获取用户信息
function apiGetUserInfo(uid){
  return request({
    url:'/user/detail',
    data:{
      uid
    }
  })
}

// 获取相似歌曲
function apiGetSimilarSongs(id){
  return request({
    url:'/simi/song',
    data:{
      id
    }
  })
}

// 获取歌曲热门评论
function apiGetHotComments(id){
  return request({
    url:'/comment/hot',
    data:{
      id,
      type:0
    }
  })
}

// 获取歌曲热门评论
function apiGetSongLyric(id){
  return request({
    url:'/lyric',
    data:{
      id
    }
  })
}


export {
  apiGetToplist,            // 获取热门榜单
  apiGetPlaylistDetail,     // 获取歌单详情
  apiGetHotSearch,          // 获取热门搜索
  apiGetSearchTips,         // 获取搜索提示
  apiSearchSongs,           // 歌曲搜索
  apiGetSongPlayUrl,        // 获取音乐播放链接
  apiGetUserInfo,           // 获取用户信息
  apiGetSimilarSongs,       // 获取相似歌曲
  apiGetHotComments,        // 获取热门评论
  apiGetSongLyric,          // 获取歌词
}