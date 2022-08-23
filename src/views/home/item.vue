<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table :data="itemList" stripe border style="width: 100%">
        <el-table-column label="物品图片" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.cover" alt="" class="item-cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="物品名称"> </el-table-column>
        <el-table-column prop="value" label="价格（元）"> </el-table-column>
        <el-table-column prop="ownerName" label="拥有者"> </el-table-column>
        <el-table-column label="详情">
          <template slot-scope="scope">
            <el-button type="info" @click="showDetail(scope.row)"> 详情信息 </el-button>
            <el-button type="primary" class="exchange" v-if="scope.row.ownerName != userInfo.userName" @click="showExchange(scope.row)">交换</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.pageNum"
        :page-sizes="[5, 10, 15]"
        :page-size="pageInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog title="物品详情" :visible.sync="detailDialogVisible" width="40%" v-model="currentItem">
      <h3>{{ currentItem.name }}</h3>
      <div class="imgs">
        <el-carousel indicator-position="outside">
          <el-carousel-item v-for="img in currentItem.imgs" :key="img">
            <img :src="img" alt="" id="carousel-img" />
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="intro">简介：{{ currentItem.intro }}</div>
      <div class="create-time">上架时间：{{ currentItem.gmtCreated }}</div>
      <div class="modified-time">修改时间：{{ currentItem.gmtModified }}</div>
    </el-dialog>

    <el-dialog title="物品交换" :visible.sync="exchangeDialogVisible" width="60%" v-model="currentItem">
      <div class="currentItem">
        <div>
          <span>需要交易的物品为：</span
          ><span
            ><b>{{ currentItem.name }}</b></span
          >
        </div>
        <div>
          <span>物品价格为：</span
          ><span
            ><b>{{ currentItem.value }} 元</b></span
          >
        </div>
      </div>
      <div class="exchangeableItem">
        <hr />
        <h3>可用于交换的物品</h3>
        <el-table :data="exchangeableItems" stripe border style="width: 100%">
          <el-table-column label="名称" prop="name" align="center"> </el-table-column>
          <el-table-column label="价格" prop="value" align="center"> </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button @click="exchange(scope.row)">交换</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'lodash'

export default {
  inject:['websocketsend'],
  data() {
    return {
      itemList: [],
      pageInfo: {
        pageNum: 1,
        pageSize: 15,
      },
      total: 0,
      detailDialogVisible: false,
      currentItem: {},
      userInfo: {},
      exchangeDialogVisible: false,
      exchangeableItems: [],
    }
  },
  created() {
    this.getitemList()
    this.getUserInfo()
  },
  methods: {
    async getitemList() {
      const { data: res } = await this.$http.post(
        `/api/item/show`, // 线上
        // `http://127.0.0.1:8083/api/item/show`, // 本地
      {
        pageNum: this.pageInfo.pageNum,
        pageSize: this.pageInfo.pageSize,
      })
      if (res.isSuccess !== true) {
        return this.$message.error('获取物品列表失败')
      }
      this.itemList = res.data.data
      this.itemList.forEach((item) => {
        item.imgs = $.parseJSON(item.imgs)
        item.cover = item.imgs[0]
      })
      this.total = res.data.totalCount
    },
    handleSizeChange(pageSize) {
      this.pageInfo.pageSize = pageSize
      this.getitemList()
    },
    handleCurrentChange(pageNum) {
      this.pageInfo.pageNum = pageNum
      this.getitemList()
    },
    showDetail(item) {
      this.detailDialogVisible = true
      this.currentItem = item
    },
    getUserInfo() {
      this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    },
    async showExchange(item) {
      this.currentItem = item
      this.exchangeDialogVisible = true
      const { data: res } = await this.$http.get(
        `/api/item/generate`, // 线上
        // `http://127.0.0.1:8083/api/item/generate`, // 本地
      {
        params: { value: item.value },
      })
      if (res.isSuccess !== true) {
        return this.$message.info('您暂时没有可交换的物品')
      }
      this.exchangeableItems = res.data
    },
    exchange(item) {
      this.$confirm('是否确认交换改物品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const itemCpoy = _.cloneDeep(item)
          const currentItemCopy = _.cloneDeep(this.currentItem)
          currentItemCopy.imgs = JSON.stringify(currentItemCopy.imgs)
          let actions = {
            type: 'notice',
            sender: this.userInfo.id,
            receiver: this.currentItem.ownerId,
            content: {
              activePartyItem: itemCpoy,
              passivePartyItem: currentItemCopy,
            },
          }
          this.sendMessage(JSON.stringify(actions))
          this.$message({
            type: 'success',
            message: '发送交换请求成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消发送交换请求',
          })
        })
    },
    sendMessage(Data) {
      this.websocketsend(Data)
    }
  },
}
</script>

<style lang="scss" scoped>
.item-cover {
  height: 100px;
  margin: 0 auto;
}
#carousel-img {
  height: 300px;
}
.exchange {
  margin-top: 20px;
}
</style>