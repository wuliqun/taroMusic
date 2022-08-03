// 获取连接参数
function getQueryString(query:string):string|null {
  const reg = new RegExp("(^|&)" + query + "=([^&]*)(&|$)", "i");
  const r = location.search.slice(1).match(reg);
  return r === null ? r : r[2];
}

// 图片模糊
// ?imageView&blur=40x20
function blurImage(url:string,blur:string="40x20"):string{
  return updateUrlQuery(url,{
    imageView:true,
    blur
  });
}
/**
 * 更新链接参数
 * @param url 
 * @param params { id:245, name:false }  值为false,将从原来链接上删除; 值为true,将不赋值 类似?imageView&w=100&h=100中的imageView
 * 若需要传a=true b=false, 需作为字符串形式传递  {name:"true",xx:"false"}
 * @returns new url
 * 示例：https://www.a.com?debug=1&id=123#/index { debug:false,id:234,uId:555,view:true }  --> https://www.a.com?id=234&uId=555&view#/index
 */
 function updateUrlQuery(url: string, params: {[k:string]:any} = {}): string {
  let hostPath = url.split('?')[0];
  let search = url.split('?')[1] || '';
  let tail = '';
  let searchObj: any = {};
  let index1 = search.indexOf('/'),
    index2 = search.indexOf('#');
  if (index1 === -1 || index1 > index2) {
    index1 = index2;
  }
  if (index1 !== -1) {
    tail = search.slice(index1);
    search = search.slice(0, index1);
  }
  search.split('&').forEach(query => {
    searchObj[query.split('=')[0]] = typeof query.split('=')[1] === 'undefined' ? true : query.split('=')[1];
  });
  for (const key in params) {
    if (params[key] === false) {
      delete searchObj[key];
    } else {
      searchObj[key] = params[key];
    }
  }
  search = '';
  for (const key in searchObj) {
    if(searchObj[key] === true){
      search += `&${key}`;
    }else{
      search += `&${key}=${searchObj[key]}`;
    }
  }
  search = search.replace(/^&/, '?');
  return hostPath + search + tail;
}


export {
  getQueryString,
  updateUrlQuery,
  blurImage
}