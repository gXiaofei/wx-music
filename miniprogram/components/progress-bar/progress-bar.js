// components/progress-bar/progress-bar.js
let movableAreaWidth = 0;
let movableViewWidth = 0;
// 当前的秒数
let currentSec = -1;
const backgroundAudioManager = wx.getBackgroundAudioManager();
// 当前歌曲的总时长，以秒为单位
let duration = 0;
// 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题
let isMoving = false 
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    progress: 0,
    movableDis: 0,
  },

  lifetimes: {
    // 组件挂在完执行
    ready() {
      this._getMovableDis();
      this._bindBGMEvent();
    }
  },
  pageLifetimes: {
    show() {
      this._setTime();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 拖拽区域change
    onChange(event) {
      // 
      // 是由拖拽产生的
      if (event.detail.source === 'touch'){
        this.data.progress = (event.detail.x / (movableAreaWidth -movableViewWidth)) * 100;
        this.data.movableDis = event.detail.x
        isMoving = true;
      }
    },
    // 
    onTouchEnd() {
      // 设置位置
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
      });
      // 设置播放时间
      backgroundAudioManager.seek(duration * this.data.progress / 100);
      isMoving = false;
    },

    // 获取进度条长度 滑块长度
    _getMovableDis(){
      const query = this.createSelectorQuery();
      query.select('.movable-area').boundingClientRect();
      query.select('.movable-view').boundingClientRect();
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false;
        this.triggerEvent('onPlay');
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('onPause');
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        const duration = backgroundAudioManager.duration;
        // 能播放
        // bug ?  
        if (duration) {
          this._setTime();
        }else{
          setTimeout(() => {
            this._setTime();
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')

        if (!isMoving){
          // 获取当前播放的时间
          const currentTime = backgroundAudioManager.currentTime;
          // 获取总时长
          const duration = backgroundAudioManager.duration;

          if (Math.floor(currentTime) !== currentSec) {
            // console.log(currentTime)
            // 格式化当前时间
            const currentTimeFmt = this._dateFormat(currentTime);
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
            })
            currentSec = Math.floor(currentTime)

            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })

      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        // 自动播放下一首
        this.triggerEvent('musicEnd');
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },
    
    _setTime() {
      duration = backgroundAudioManager.duration;
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      // 分钟
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec),
      }
    },
    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
