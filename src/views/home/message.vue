<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的消息</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-empty description="暂无交换请求" v-if="unReadMsg.length == 0"></el-empty>
      <el-card class="request" v-for="msg in unReadMsg" :key="msg.content.id">
        <div class="title">
          <b>{{ msg.content.activePartyItem.ownerName }}</b> 请求交换
        </div>
        <el-row>
          <el-col :span="10" class="item-box">
            <el-row>
              <el-col class="img" :span="14">
                <img :src="JSON.parse(msg.content.activePartyItem.imgs)[0]" alt="" class="cover" />
              </el-col>
              <el-col class="info" :span="10">
                <div class="name">物品名称：{{ msg.content.activePartyItem.name }}</div>
                <div class="owner">拥有者：{{ msg.content.activePartyItem.ownerName }}</div>
                <div class="value">
                  价格：<b>{{ msg.content.activePartyItem.value }}</b> 元
                </div>
              </el-col>
            </el-row>
          </el-col>

          <el-col :span="4" class="operate">
            <el-button type="primary" @click="confirm(msg)">确认交换</el-button>
            <img src="../../assets/imgs/exchange.png" alt="" />
            <el-button type="danger" @click="reject(msg)">拒绝交换</el-button>
          </el-col>

          <el-col :span="10" class="item-box">
            <el-row>
              <el-col class="img" :span="14">
                <img :src="JSON.parse(msg.content.passivePartyItem.imgs)[0]" alt="" class="cover" />
              </el-col>
              <el-col class="info" :span="10">
                <div class="name">物品名称：{{ msg.content.passivePartyItem.name }}</div>
                <div class="owner">拥有者：{{ msg.content.passivePartyItem.ownerName }}</div>
                <div class="value">
                  价格：<b>{{ msg.content.passivePartyItem.value }}</b> 元
                </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { unReadMessage } from './index.vue'
import { returnMessage } from './index.vue'

export default {
  inject: ['websocketsend'],
  data() {
    return {
      unReadMsg: unReadMessage,
    }
  },
  methods: {
    confirm(msg) {
      this.$confirm('请确认是否与其进行交换', '提示', {
        confirmButtonText: '确定交换',
        cancelButtonText: '再考虑考虑',
        type: 'warning',
      })
        .then(() => {
          let actions = {
            type: 'agree',
            sender: msg.receiver,
            content: {
              id: msg.content.id,
              activePartyItem: msg.content.activePartyItem,
              passivePartyItem: msg.content.passivePartyItem,
            },
          }
          this.sendMessage(JSON.stringify(actions))
          let _this = this
          const loading = this.$loading({
            lock: true,
            text: '正在交换中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          })
          setTimeout(function () {
            _this.removeMsg(msg)
            loading.close();
          }, 3000)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消该操作',
          })
        })
    },
    reject(msg) {
      this.$confirm('请确认是否拒绝与其进行交换', '提示', {
        confirmButtonText: '拒绝交换',
        cancelButtonText: '再考虑考虑',
        type: 'warning',
      })
        .then(() => {
          let actions = {
            type: 'reject',
            sender: msg.receiver,
            content: {
              id: msg.content.id,
              activePartyItem: msg.content.activePartyItem,
              passivePartyItem: msg.content.passivePartyItem,
            },
          }
          this.sendMessage(JSON.stringify(actions))
          this.$message({
            type: 'success',
            message: '已拒绝交换!',
          })
          this.$router.go(0)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消该操作',
          })
        })
    },
    sendMessage(Data) {
      this.websocketsend(Data)
    },
    removeMsg(msg) {
      if (returnMessage.type == 'error') {
        this.$message.error('交换失败，物品中的一方已经被交换')
        this.errorMsg = {}
      } else {
        this.$message.success('交换成功')
      }
      const index = this.unReadMsg.indexOf(msg)
      this.unReadMsg.splice(index, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.cover {
  height: 100px;
}
.info {
  height: 104px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.el-row {
  display: flex;
  align-items: center;
  justify-content: center;
}fullscreenLoading
.item-box {
  padding: 10px;
}
.operate {
  display: flex;
  flex-direction: column;
  align-items: center;
  img {
    width: 50px;
  }
}
.title {
  margin-bottom: 10px;
}
</style>