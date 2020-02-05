// components/lyric/lyric.js
let lyricHeight = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: Boolean,
    lyric: String
  },

  observers: {
    lyric(lrc) {
      if (lrc == '暂无歌词') {
        this.setData({
          lrcList: [{
            lrc,
            time: 0,
          }],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 歌词
    lrcList: [],
    // 选中歌词的索引
    nowLyricIndex: 0,
    // 滚动条滚动的高度
    scrollTop: 0,
  },

  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: function(res) {
          // 获取设备的信息
          // res.screenWidth / 750  求出 1rpx 的大小  =》 px
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateTime(currentTime) {
      const lrcList = this.data.lrcList;
      if (!lrcList.length) {
        return;
      }

      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight,
          })
        }
      } 
      
      for (let i = 0; i < lrcList.length; i++) {
        if (currentTime <= lrcList[i].time) {
          if (this.data.nowLyricIndex != i - 1) {
            this.setData({
              nowLyricIndex: i - 1,
              scrollTop: (i - 1) * lyricHeight
            });
          }
          break
        }
      }
    },
    //解析歌词
    _parseLyric(sLyric) {
      const line = sLyric.split('\n');
      const _lrcList = [];
      line.forEach(elem => {
        // 匹配前面的时间
        const time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g);

        if (time) {
          // 取到歌词
          let lrc = elem.split(time)[1];
          // 取到分 秒 毫秒
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/);

          // 把时间转换为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000;

          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
        this.setData({
          lrcList: _lrcList
        })

      })
    }
  }
})