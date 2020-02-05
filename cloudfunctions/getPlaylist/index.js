// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const URL = 'http://musicapi.xiecheng.live/personalized';
const rq = require('request-promise');
const {
  differenceBy
} = require('lodash');
const db = cloud.database();
const playlistCollection = db.collection('playlist');
const MAX_LIMIT = 10;
// 云函数入口函数
exports.main = async(event, context) => {
  // 云函数只能获取100条  小程序获取20条
  // const oriPlaylist = await playlistCollection.get();

  // 获取总条数
  const countResult = await playlistCollection.count();
  // 需要取多少次
  const batchTimes = Math.ceil(countResult.total / MAX_LIMIT)

  const tasks = [];

  for (let i = 0; i < batchTimes; i++) {
    const promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
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

  const playlist = await rq(URL).then(res => {
    return JSON.parse(res).result;
  }).catch(err => {
    console.log(err)
  });

  // 返回去重后的数组
  const newPlaylist = differenceBy(playlist, oriPlaylist.data, 'id');

  // 插入数据库
  for (let i = 0; i < newPlaylist.length; i++) {
    await playlistCollection.add({
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