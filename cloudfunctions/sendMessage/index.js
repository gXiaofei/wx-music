// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID} = cloud.getWXContext()
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      data: {
        time2: {
          value: moment(event.time).utcOffset("+08:00").format('YYYY-MM-DD hh:mm:ss')
        },
        thing1: {
          value: event.content
        }
      },
      templateId: 'e_vXhkqd271JyZAAglBhpMMhZB8P-Mn-7mnztwGu3UI'
    })
    return result
  } catch (err) {
    return err
  }
}