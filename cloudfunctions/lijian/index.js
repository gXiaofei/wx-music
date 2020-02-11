// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const BASE_URL = 'http://musicapi.xiecheng.live';
const rq = require('request-promise');
const {
  differenceBy
} = require('lodash');
const db = cloud.database();
const lijianCollection = db.collection('lijian');
const MAX_LIMIT = 100;
const id = 3695;
// 云函数入口函数
exports.main = async(event, context) => {


  // rq(BASE_URL + '/search?keywords=lijian').then(res => {
  //   console.log(res);
  //   debugger;
  // })
  // return;

  debugger;
  // 获取总条数
  const countResult = await lijianCollection.count();
  // 需要取多少次
  const batchTimes = Math.ceil(countResult.total / MAX_LIMIT)

  const tasks = [];

  for (let i = 0; i < batchTimes; i++) {
    const promise = lijianCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
    tasks.push(promise);
  }

  let oriPlaylist = {
    data: []
  }

  if (tasks.length) {
    oriPlaylist = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  const playlist = await rq(BASE_URL + '/artists?id=' + id).then(res => {
    const data = JSON.parse(res)
    return data.hotSongs
  }).catch(err => {
    console.log(err)
  });
  // 返回去重后的数组
  const newPlaylist = differenceBy(playlist, oriPlaylist.data, 'id');

  // 插入数据库
  for (let i = 0; i < playlist.length; i++) {
    await lijianCollection.add({
      data: {
        ...newPlaylist[i],
        createTime: db.serverDate(),
      }
    }).then(res => {
      console.log('插入成功')
    }).catch(err => {
      console.log('插入失败')
    })
  }

  return newPlaylist.length;
}