// pages/player/player.js

let musiclist = [];
// 正在播放的index
let nowPlayingIndex = 0;
// 获取全局唯一的背景音乐管理器
const backgroundAudioManaget = wx.getBackgroundAudioManager();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,
    isLyricShow: false,
    lyric: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options);
    nowPlayingIndex = options.index || 0;
    musiclist = wx.getStorageSync('musiclist');
    this._loadMusicDetail(options.musicId);
  },


  togglePlaying() {

    const isPlaying = this.data.isPlaying;
    this.setData({
      isPlaying: !isPlaying,
    })

    if (isPlaying) {
      backgroundAudioManaget.pause();
    } else {
      backgroundAudioManaget.play();
    }
  },

  onPrev() {
    nowPlayingIndex--;
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1;
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id);
  },
  onNext() {
    nowPlayingIndex++;
    if (nowPlayingIndex > musiclist.length - 1) {
      nowPlayingIndex = 0;
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id);
  },
  // 歌词切换
  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  // 将当前时间传递给歌词
  timeUpdate(event) {
    this.selectComponent('.lyric').updateTime(event.detail.currentTime)
  },

  // 加载音乐详情
  _loadMusicDetail(musicId) {

    let isSame = false;
    if (musicId == app.getPlayingMusicId()) {
      isSame = true;
      backgroundAudioManaget.play();
    }

    if (!isSame) {
      backgroundAudioManaget.stop();
    }

    // 获取当前播放音乐 
    const music = musiclist[nowPlayingIndex];

    // console.log(music);
    wx.setNavigationBarTitle({
      title: music.name,
    });

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false,
    });

    wx.showLoading({
      title: '歌曲加载中',
    });

    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then(res => {
      // console.log(JSON.parse(res.result));
      const result = JSON.parse(res.result);
      if (result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if (!isSame) {
        backgroundAudioManaget.title = music.name;
        backgroundAudioManaget.src = result.data[0].url;
        backgroundAudioManaget.coverImgUrl = music.al.picUrl;
        backgroundAudioManaget.singer = music.ar[0].name;
        backgroundAudioManaget.epname = music.al.name;

        // 存储历史歌曲
        this.savePlayHistory(music);
      }
      this.setData({
        isPlaying: true,
      });

      // 设置当前播放的musicid 到全局变量
      app.setPlayingMusicId(musicId);

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric',
        }
      }).then(res => {
        wx.hideLoading();
        let lyric = '暂无歌词';
        const lrc = JSON.parse(res.result).lrc
        if (lrc && lrc.lyric) {
          lyric = lrc.lyric;
        }
        this.setData({
          lyric,
        })
      })
    })
  },
  onPlay() {
    this.setData({
      isPlaying: true,
    })
  },
  onPause() {
    this.setData({
      isPlaying: false,
    })
  },

  // 保存播放历史
  savePlayHistory(music) {
    const openid = app.globalData.openid;
    const history = wx.getStorageSync(openid);

    let index = -1;
    let flag = false;

    for (let i = 0; i < history.length; i++) {
      if (history[i].id === music.id) {
        flag = true;
        index = i;
        break;
      }
    }

    if (!flag) {
      history.unshift(music);
    } else {
      if(index !== -1 && index !== 0){
        history.splice(index, 1);
        history.unshift(music);
      }
    }

    wx.setStorage({
      key: openid,
      data: history,
    })
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