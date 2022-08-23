<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>上传物品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <h2>上传物品</h2>
      <el-form label-position="top" :model="uploadForm" :rules="uploadRules" ref="uploadRef">
        <el-form-item label="物品名称" align="left" prop="name">
          <el-input v-model="uploadForm.name"></el-input>
        </el-form-item>

        <el-form-item label="物品价格（元）" align="left" prop="value">
          <el-input v-model="uploadForm.value" type="number"></el-input>
        </el-form-item>

        <el-form-item label="物品介绍" align="left" prop="intro">
          <el-input v-model="uploadForm.intro"></el-input>
        </el-form-item>

        <el-form-item prop="imgs">
          <el-upload class="upload-demo" drag action="#" multiple :auto-upload="false" ref="uploadRef" :on-change="handleChange" :on-remove="handleRemove" :fileList="fileList" list-type="picture">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
        <el-button type="primary" @click="upload">点击提交</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    let validateImage = (rule, value, callback) => {
      //验证器
      if (this.fileList.length == 0) {
        //为true代表图片在  false报错
        callback(new Error('请上传图片'))
      } else {
        callback()
      }
    }
    return {
      uploadForm: {
        name: '',
        value: 0,
        intro: '',
        imgs: [],
      },
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
        imgs: [{ required: true, validator: validateImage, trigger: 'change' }],
      },
      fileList: [],
    }
  },
  methods: {
    async upload() {
      this.$refs.uploadRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const formData = new FormData()
        formData.append('name', this.uploadForm.name)
        formData.append('value', this.uploadForm.value - 0.0)
        formData.append('intro', this.uploadForm.intro)
        this.fileList.forEach((item) => {
          formData.append('imgs', item.raw)
        })

        const { data: res } = await this.$http.post(
          `/api/item/upload`, // 线上
          // `http://127.0.0.1:8083/api/item/upload`, // 本地
          formData,
           {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 20000,
        })
        if (res.isSuccess !== true) {
          return this.$message.error('上传失败')
        }
        this.$message.success('上传成功')
        this.$router.push('/item')
      })
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      this.fileList = fileList
    },
  },
}
</script>

<style lang="scss" scoped>
</style>