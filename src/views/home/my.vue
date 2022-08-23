<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>我的物品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-collapse accordion>
        <el-collapse-item :title="item.name + '  上架于：' + item.gmtCreated" :name="item.id" v-for="item in myItemList" :key="item.id">
          <div class="imgs">
            <el-carousel indicator-position="outside">
              <el-carousel-item v-for="img in item.imgs" :key="img">
                <img :src="img" alt="" />
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="intro">
            {{ item.intro }}
          </div>
          <div class="operate">
            <el-button type="primary" icon="el-icon-edit" @click="showEditItem(item)">修改</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteItem(item.id)">删除</el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-dialog title="修改物品信息" :visible.sync="eidtDialogVisible" width="50%"  @close="handleClose">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadRef">
        <el-form-item label="物品名称" align="left" prop="name">
          <el-input v-model="uploadForm.name"></el-input>
        </el-form-item>

        <el-form-item label="物品价格（元）" align="left" prop="value">
          <el-input v-model="uploadForm.value" type="number"></el-input>
        </el-form-item>

        <el-form-item label="物品介绍" align="left" prop="intro">
          <el-input v-model="uploadForm.intro"></el-input>
        </el-form-item>

        <el-form-item>
          <el-upload
            class="upload-demo"
            drag
            action="#"
            multiple
            :auto-upload="false"
            ref="uploadRef"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :fileList="fileList"
            list-type="picture"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            <div class="el-upload__tip" slot="tip">若不重新上传图片，则保持原图片列表</div>
          </el-upload>
        </el-form-item>
        <el-button type="primary" @click="edit">点击修改</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import $ from 'jquery'
import _ from 'lodash'

export default {
  data() {
    return {
      myItemList: [],
      eidtDialogVisible: false,
      currentItem: {},
      fileList: [],
      uploadRules: {
        name: [
          { required: true, message: '物品名称不能为空', trigger: 'blur' },
          { min: 1, max: 64, message: '名称长度需要在 1 - 64 字数之间', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '物品价格不能为空', trigger: 'blur' },
          { min: 1, max: 10, message: '价格在 1 - 8 位之间', trigger: 'blur' }
        ],
        intro: [
          { required: true, message: '简介不能为空', trigger: 'blur' },
          { min: 1, max: 256, message: '简介长度需要在 1 - 256 个字数之间', trigger: 'blur' }
        ],
      },
      uploadForm: {
        id:'',
        name: '',
        value: 0,
        intro: '',
        imgs: [],
      },
    }
  },
  created() {
    this.getMyitemList()
  },
  methods: {
    async getMyitemList() {
      const { data: res } = await this.$http.get(`/api/item/myitems`) // 线上
      // const { data: res } = await this.$http.get(`http://127.0.0.1:8083/api/item/myitems`) // 本地
      if (res.isSuccess === false) {
        return this.$message.info('您暂时没有上传物品')
      }
      this.myItemList = res.data
      this.myItemList.forEach((item) => {
        item.imgs = $.parseJSON(item.imgs)
      })
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      this.fileList = fileList

    },
    showEditItem(item) {
      this.currentItem = item
      this.eidtDialogVisible = true
      this.uploadForm = _.cloneDeep(this.currentItem) // 深拷贝
    },
    edit() {
      this.$refs.uploadRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const formData = new FormData()
        formData.append('id', this.uploadForm.id)
        formData.append('name', this.uploadForm.name)
        formData.append('value', this.uploadForm.value - 0.0)
        formData.append('intro', this.uploadForm.intro)
        this.fileList.forEach((item) => {
          formData.append('imgs', item.raw)
        })

        const { data: res } = await this.$http.post(
          `/api/item/update`, // 线上
          // `http://127.0.0.1:8083/api/item/update`, // 本地
          formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 20000,
        })
        if (res.isSuccess !== true) {
          return this.$message.error('上传失败')
        }
        this.$message.success('上传成功')
        this.eidtDialogVisible = false
        this.getMyitemList()
      })
    },
    handleClose() {
      this.fileList = []
    },
    deleteItem(id) {
      this.$confirm('此操作将永久删除该物品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(
          `/api/item/delete`, // 线上
          // `http://127.0.0.1:8083/api/item/delete`, // 本地
          {
          params:{itemId:id}
        })
        if(res.isSuccess === false) {
          return this.$message.error("删除错误")
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.getMyitemList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    }
  },
}
</script>

<style lang="scss" scoped>
.el-carousel__item {
  background-color: #eee;
  height: 250px;
  img {
    height: 250px;
  }
}
.operate {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>