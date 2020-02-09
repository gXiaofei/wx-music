// components/blog-ctrl/blog-ctrl.js
let userInfo = null;
const db = wx.cloud.database();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    // 底部弹出层是否显示
    modalShow: false,
    // 登录组件是否显示
    loginShow: false,
    // 发布内容
    content: '',
    // 发送提醒消息
    messageShow: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 判断是否授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo;
                // 显示底部弹出层
                this.setData({
                  modalShow: true,
                })
              }
            })
          } else {
            this.setData({
              loginShow: true,
            })
          }
        }
      })
    },
    onLoginSuccess(event) {
      userInfo = event.detail;
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true,
        })
      })
    },
    onLoginFail() {
      wx.showModal({
        title: '授权用户才能进行评论',
        content: '',
      })
    },
    onSend() {
      // 插入数据到数据库
      const content = this.data.content;
      if (content.trim() === '') {
        wx.showModal({
          title: '评论的内容不能为空',
          content: '',
        })
        return;
      }

      wx.showLoading({
        title: '评论中',
        mask: true,
      })

      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          messageShow: true,
        })
        this.triggerEvent('refreshCommentList')
      })

      // 推送模板消息
    },
    // 发送提醒消息
    onMessage() {
      wx.requestSubscribeMessage({
        tmplIds: ['e_vXhkqd271JyZAAglBhpMMhZB8P-Mn-7mnztwGu3UI'],
        success: (res) => {
          wx.cloud.callFunction({
            name: 'sendMessage',
            data: {
              time: new Date(),
              content: this.data.content,
              blogId: this.properties.blogId
            }
          }).then(res => {
            this.setData({
              content: '',
              messageShow: false,
            })
          })

        },
        fail(err) {
          this.setData({
            content: '',
            messageShow: false,
          })
        }
      })
    },
    onInput(event) {
      this.setData({
        content: event.detail.value
      })
    },
  }
})