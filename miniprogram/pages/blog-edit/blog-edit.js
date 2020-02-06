// 输入文字最大的个数
const MAX_WORDS_NUM = 140;
// 最大上传图片数量
const MAX_IMG_NUM = 9;

const db = wx.cloud.database();

let userInfo = null;

let content = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 输入的文字个数
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    // 添加图片元素是否显示
    selectPhoto: true,
  },

  onInput(event) {
    const value = event.detail.value;
    let wordsNum = value.length;
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`;
    }

    this.setData({
      wordsNum
    })
    content = value;
  },

  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height,
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  // 点击选择图片
  onChooseImage() {
    let max = MAX_IMG_NUM - this.data.images.length;

    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths),
        })
        max = MAX_IMG_NUM - this.data.images.length;
        this.setData({
          selectPhoto: max <= 0 ? false : true,
        })
      },
    })
  },
  // 删除图片
  onDelImage(event) {
    const index = event.target.dataset.index;
    this.data.images.splice(index, 1);
    this.setData({
      images: this.data.images,
    })
    if (this.data.images.length === MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },

  // 预览图片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    });
  },

  // 发布
  send() {

    if (content.trim() === '') {
      wx.showModal({
        title: '内容不能为空',
        content: '',
      })
      return;
    }

    wx.showLoading({
      title: '发布中...',
      mask: true,
    })

    const images = this.data.images;

    const promiseArr = [];
    const fileIds = [];
    images.forEach(item => {

      const p = new Promise((resolve, rejest) => {
        // 获取文件扩展名
        const suffix = /\.\w+$/.exec(item)[0];

        wx.cloud.uploadFile({
          // 名称相同的图片  后面上传的会把前面的覆盖掉
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item,
          success: (res) => {
            // console.log(res);
            fileIds.push(res.fileID);
            resolve();
          },
          fail: (err) => {
            console.error(err)
            // TODO 这里应该删除这批次上传成功的图片  这些图片上传到了云存储但是没到云数据库
            rejest();
          }
        })

      })

      promiseArr.push(p);
    })

    Promise.all(promiseArr).then(res => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          // 服务端的时间
          createTime: db.serverDate(),
        }
      })
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
      })
      content = '';
      // 返回blog页面，并且刷新
      wx.navigateBack();
      // 获取到当前的page页面
      const pages = getCurrentPages();
      // 获取上一个页面
      pages[pages.length - 2].onPullDownRefresh();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '发布失败',
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options);
    userInfo = options;
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})