// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: Object
  },
  // 监听
  observers: {
    ['playlist.playCount'](count) {
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转音乐列表
    goToMusiclist() {
      wx.navigateTo({
        url: `/pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },

    // 对数据的转换处理
    _tranNumber(count, point) {
      const numStr = count.toString().split('.')[0];
      const length = numStr.length;
      if (length <= 6) {
        return numStr;
      } else if (length > 6 && length <= 8) {
        return (count / 10000).toFixed(point) + '万'
      } else if (length > 8) {
        return (count / 100000000).toFixed(point) + '亿'
      }
    }
  }
})