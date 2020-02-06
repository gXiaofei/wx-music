// miniprogram/pages/blog/blog.js
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 是否显示底部弹出层
    modalShow: false,
    blogList: [],
  },

  // 发布
  onPublish() {
    // 判断是否授权
    wx.getSetting({
      success: (res) => {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // 授权过 获取用户的信息
          wx.getUserInfo({
            success: (res) => {
              const userInfo = res.userInfo;
              this.onLoginSuccess({
                detail: userInfo
              })
              console.log(res);
            }
          })
        } else {
          this.setData({
            modalShow: true,
          })
        }
      }
    })
  },

  onLoginSuccess(event) {
    console.log(event)
    const detail = event.detail;
    wx.navigateTo({
      url: `/pages/blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },

  onLoginFail() {
    wx.showToast({
      title: '授权用户才能发布',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadBlogList()
  },


  _loadBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中',
    });

    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list'
      }
    }).then(res => {
      console.log(res);
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading();
      wx.stopPullDownRefresh();
    }).catch(err => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    })
  },

  goToComment(event) {
    const blogid = event.target.dataset.blogid;
    wx.navigateTo({
      url: `/pages/blog-comment/blog-comment?blogId=${blogid}`,
    })
  },

  onSearch(event) {
    this.setData({
      blogList: []
    })
    keyword = event.detail.keyword
    this._loadBlogList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      blogList: []
    });
    this._loadBlogList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})