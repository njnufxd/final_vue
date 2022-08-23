<template>
  <div class="home">
    <el-container>
      <!-- 头部 -->
      <el-header>
        <div class="left">
          <h2>物品交易系统</h2>
        </div>

        <div class="right">
          <span>欢迎您：{{ userInfo.userName }}</span>
          <el-button type="danger" size="mini" @click="logout">退出</el-button>
        </div>
      </el-header>

      <el-container>
        <!-- 侧边栏 -->
        <el-aside>
          <el-menu class="el-menu-vertical-demo" router :default-active="this.$route.path.replace('/', '')">
            <el-menu-item index="item">
              <i class="el-icon-menu"></i>
              <span slot="title">物品列表</span>
            </el-menu-item>

            <el-menu-item index="my">
              <i class="el-icon-s-custom"></i>
              <span slot="title">我的物品</span>
            </el-menu-item>

            <el-menu-item index="upload">
              <i class="el-icon-upload"></i>
              <span slot="title">上传物品</span>
            </el-menu-item>

            <el-badge :value="unReadMessage.length" class="item" type="primary" :hidden="unReadMessage.length == 0">
              <el-menu-item index="message">
                <i class="el-icon-bell"></i>
                <span slot="title">我的消息</span>
              </el-menu-item>
            </el-badge>
          </el-menu>
        </el-aside>

        <!-- 主体内容 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      menuList: [],
      isCollapse: false,
      websockUrl: 'ws://exchange-prod-7gcbt0vgdd0f6605-1309556468.ap-shanghai.run.wxcloudrun.com/websocket/', // 线上websock地址
      // websockUrl: 'ws://127.0.0.1:8084/websocket/', // 本地websock地址
      websock: null, // websock实例
      unReadMessage: unReadMessage,
      lockReconnect: false, //是否真正建立连接
      timeout: 30 * 1000, //30秒一次心跳
      timeoutObj: null, //心跳心跳倒计时
      serverTimeoutObj: null, //心跳倒计时
      timeoutnum: null, //断开 重连倒计时
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    this.initWebSocket()
  },
  destroyed() {
    // 离开路由之后断开websocket连接
    this.websock.close()
  },
  provide() {
    return {
      websocketsend: this.websocketsend,
    }
  },
  methods: {
    // 退出登录
    logout() {
      this.$confirm('是否退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          // const { data: res } = await this.$http.get(`/api/user/logout`) // 线上
          const { data: res } = await this.$http.get(`http://127.0.0.1:8082/api/user/logout`) // 线下
          if (res.isSuccess !== true) {
            return this.$message.error('退出失败')
          }
          this.$message({
            type: 'success',
            message: '退出成功!',
          })
          sessionStorage.clear()
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出',
          })
        })
    },
    initWebSocket() {
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      let socketUrl = this.websockUrl + this.userInfo.id
      if (typeof WebSocket === 'undefined') return console.log('您的浏览器不支持websocket')
      this.websock = new WebSocket(socketUrl)
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() {
      this.$message.success('已成功建立连接')
      //开启心跳
      this.start()
    },
    websocketonerror() {
      // 连接建立失败重连
      this.$message.error('连接出错，正在重新发起连接')
      // this.initWebSocket()
      //重连
      this.reconnect()
    },
    websocketonmessage(res) {
      // 数据接收
      const redata = JSON.parse(res.data)
      if (redata.type == 'notice' && redata.content.status == 'EXCHANGING') {
        unReadMessage.push(redata)
      } else {
        returnMessage = redata
      }
      //收到服务器信息，心跳重置
      this.reset()
    },
    websocketsend(Data) {
      // 数据发送
      this.websock.send(Data)
    },
    websocketclose() {
      // 关闭
      this.$notify.error({
        title: '连接已断开',
        message: '请尝试刷新页面或等待服管理猿修复BUG',
        position: 'bottom-left',
      })
      //重连
      this.reconnect()
    },
    reconnect() {
      //重新连接
      var that = this
      if (that.lockReconnect) {
        return
      }
      that.lockReconnect = true
      //没连接上会一直重连，设置延迟避免请求过多
      that.timeoutnum && clearTimeout(that.timeoutnum)
      that.timeoutnum = setTimeout(function () {
        //新连接
        that.initWebSocket()
        that.lockReconnect = false
      }, 5000)
    },
    reset() {
      //重置心跳
      var that = this
      //清除时间
      clearTimeout(that.timeoutObj)
      clearTimeout(that.serverTimeoutObj)
      //重启心跳
      that.start()
    },
    start() {
      //开启心跳
      var self = this
      self.timeoutObj && clearTimeout(self.timeoutObj)
      self.serverTimeoutObj && clearTimeout(self.serverTimeoutObj)
      self.timeoutObj = setInterval(function () {
        //这里发送一个心跳，后端收到后，返回一个心跳消息，
        if (self.websock.readyState == 1) {
          //如果连接正常
          self.websock.send('1')
        } else {
          //否则重连
          self.reconnect()
        }
      }, self.timeout)
    },
  },
}
export let unReadMessage = []
export let returnMessage = {}
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-main {
  height: 100%;
  background: #eaedf1;
}

.el-header {
  background: #93defd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;

  .left {
    display: flex;
    align-items: center;
    img {
      width: 40px;
      margin-right: 20px;
    }
    span {
      font-size: 20px;
    }
  }

  .right {
    span {
      margin-right: 10px;
    }
  }
}

.el-aside {
  height: 100%;

  .toggle-button {
    background: #60779d;
    line-height: 24px;
    font-size: 16px;
    color: #fff;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }

  .el-menu {
    text-align: left;
    height: auto;
    border-right: 0;
    width: 280px;
  }
}
.el-badge {
  width: 100%;
}
</style>