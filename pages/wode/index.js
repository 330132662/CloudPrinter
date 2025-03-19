const app = getApp()

// pages/wode/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hideLogin: true,
        userInfo: {},
        nickname: "",
        avatarUrl: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getUserInfo();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    zt(e) {
        let url = e.currentTarget.dataset.url;
        console.log(url);
        wx.navigateTo({
            url: '../' + url + '/index',
        })
    },
    getUserInfo: function () {
        let that = this

        wx.getStorage({
            key: 'user',
            success: res1 => {
                that.setData({
                    userInfo: res1.data
                });
                that.reqUserInfo();
            },
            fail: err => {
                wx.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                that.setData({
                    hideLogin: false
                });
                return;
            }
        });


    },
    updateAva(res) {
        var ava = res.detail.avatarUrl;
        // console.log("头像", ava);
        var _this = this;

        let file = {
            path: ava,
            filename: this.data.userInfo.openid + "_ava",
            // doc_type: 1
        };
        app.upload(file).then(result => {
            var avahttpurl = result.data["savename"];
            //  上传成功 马上保存给用户信息里

            this.setData({
                avatarUrl: avahttpurl,
            });


            this.updateUserinfo();
            console.log("ok");
        }, err => {
            wx.showModal({
                title: "错误",
                content: (file.filename + err.msg) || (file.filename + JSON.stringify(err))
            })
            console.log(err)
        })
    },
    reqUserInfo() {
        //     主要获取昵称和头像  
        var _this = this;
        // var nick = e.detail.value;
        let data = {
            "openid": _this.data.userInfo.openid,
            // "nick": nick,
        };
        wx.request({
            url: `${app.api}/api/user`,
            method: "GET",
            data: data,
            success: res => {
                _this.setData({
                    hideLogin: true
                });
                res = res.data;
                var resp = res.data;
                // console.log("a1", resp);
                if (res.code === 0) {
                    // 处理本地缓存和data里的值 

                    _this.setData({
                        hideLogin: true,
                        nickname: resp.nickName,
                        avatarUrl: resp.avatarUrl,
                    });
                    console.log(_this.nickName, _this.avatarUrl);


                } else {
                    wx.hideLoading()
                    wx.showModal({
                        title: "错误",
                        success: res => {
                            wx.reLaunch({
                                url: '/pages/index/index',
                            })
                            return true;
                        }
                    })
                }
            }
        })
    },
    bindinput(e) {
        // console.log("b", e.detail);
        var nick = e.detail.value;
        this.setData({
            nickname: nick,
        })
        this.updateUserinfo();
    },
    /**
     *  请求更新用户信息 
     */
    updateUserinfo() {
        var _this = this;

        let data = {
            "openid": _this.data.userInfo.openid,
            "nick": _this.data.nickname,
            "avatar": _this.data.avatarUrl
        };
        wx.request({
            url: `${app.api}/api/user/updateUser`,
            method: "POST",
            data: data,
            success: res => {
                _this.setData({
                    hideLogin: true
                });
                res = res.data;
                if (res.code === 0) {
                    // 处理本地缓存和data里的值 
                    //  _this.data.userInfo.nickname = nick ;
                    //  console.log(_this.data.userInfo);

                } else {
                    wx.hideLoading()
                    wx.showModal({
                        title: "错误",
                        success: res => {
                            wx.reLaunch({
                                url: '/pages/index/index',
                            })
                            return true;
                        }
                    })
                }
            }
        })
    },
    userProfile() {
        var _this = this;
        var canIUseGetUserProfile = false;
        if (wx.getUserProfile) {
            console.log("getUserProfile可用 ");
            canIUseGetUserProfile = true;
        }
        wx.getUserProfile({
            lang: "zh_CN",
            desc: "用户信息查询",
            fail: err => {
                console.warn(err);
            },
            success: data => {
                console.log("a2", data);
                wx.login({
                    success: res => {
                        let code = res.code;
                        let post = {
                            code: code,
                            iv: data.iv,
                            encryptedData: data.encryptedData,
                            signature: data.signature
                        };
                        wx.request({
                            url: `${app.api}/api/user/login`,
                            method: "POST",
                            data: post,
                            success: res => {
                                _this.setData({
                                    hideLogin: true
                                });
                                res = res.data;
                                if (res.code === 0) {
                                    wx.setStorage({
                                        data: res.data.user,
                                        key: 'user',
                                        success: res => {
                                            wx.showToast({
                                                title: '登录成功',
                                            })
                                        }
                                    })
                                    _this.setData({
                                        userInfo: res.data.user
                                    });
                                } else {
                                    wx.hideLoading()
                                    wx.showModal({
                                        title: "错误",
                                        success: res => {
                                            wx.reLaunch({
                                                url: '/pages/index/index',
                                            })
                                            return true;
                                        }
                                    })
                                }
                            }
                        })
                    },
                })
            }
        })
    },
    login_user: function () {
        let _this = this;
        wx.showLoading({
            title: '登录中...',
            mask: true
        })
        if (typeof wx.getUserProfile == "undefined") {
            //pc端小程序不支持新接口
            console.log('getUserInfo')
            wx.getUserInfo({
                lang: 'zh_CN',
                success: data => {
                    wx.login({
                        success: res => {
                            let code = res.code;
                            let post = {
                                code: code,
                                iv: data.iv,
                                encryptedData: data.encryptedData,
                                signature: data.signature
                            };
                            wx.request({
                                url: `${app.api}/api/user/login`,
                                method: "POST",
                                data: post,
                                success: res => {
                                    _this.setData({
                                        hideLogin: true
                                    })
                                    res = res.data;
                                    if (res.code === 0) {
                                        wx.setStorage({
                                            data: res.data.user,
                                            key: 'user',
                                            success: res => {
                                                wx.showToast({
                                                    title: '登录成功',
                                                })
                                            }
                                        })
                                        _this.setData({
                                            userInfo: res.data.user
                                        });
                                    } else {
                                        wx.hideLoading()
                                        wx.showModal({
                                            title: "错误",
                                            success: res => {
                                                wx.reLaunch({
                                                    url: '/pages/index/index',
                                                })
                                                return true;
                                            }
                                        })
                                    }
                                }
                            })
                        },
                    })
                }
            })
        } else {
            _this.userProfile();
        }
    },
})