// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    // 将返回buffer
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: wxContext.OPENID,
      page: "pages/playlist/playlist",
      isHyaline: true,
      lineColor: {
        'r': 211,
        'g': 60,
        'b': 57
      }
    })
    // 对buffer进行转化 存储
    const upload = await cloud.uploadFile({
      cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
      fileContent: result.buffer,
    })
    // fileID
    return upload.fileID
  } catch (err) {
    console.log(err)
    return err
  }
}