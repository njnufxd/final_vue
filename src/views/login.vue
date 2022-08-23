<template>
  <div id="index">
    <el-card>
      <el-form :model="loginForm" :rules="loginRules" ref="loginRef" label-width="80px" @keyup.enter.native="login">
        <h2>物品交换系统登录</h2>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="loginForm.userName" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input v-model="loginForm.pwd" placeholder="请输入密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <el-row>
            <el-col :span="16">
              <el-input v-model="loginForm.code" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="8" class="code-box">
              <img src="#" alt="" class="code" id="codeImage" />
              <span @click="getCode" style="cursor: pointer"> 点击刷新 </span>
            </el-col>
          </el-row>
        </el-form-item>

        <el-button type="primary" @click="login">登录</el-button>
        <div class="route">
          <router-link to="/register">没有账号？前往注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  data() {
    return {
      loginForm: {
        userName: '',
        pwd: '',
        code: '',
      },
      loginRules: {
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        pwd: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        code: [{ required: true, message: '验证码不能为空', trigger: 'blur' }],
      },
      codeUrl: '',
    }
  },
  created() {
    this.getCode()
  },
  methods: {
    // 登录请求
    login() {
      this.$refs.loginRef.validate(async (valid) => {
        if (!valid) {
          return
        }

        const { data: res } = await this.$http.post(
          `/api/user/login`, // 线上
          // `http://127.0.0.1:8082/api/user/login`, // 本地
          this.$qs.stringify({
            userName: this.loginForm.userName,
            pwd: this.loginForm.pwd,
            code: this.loginForm.code,
          }),
          { withCredentials: true }
        )

        if (res.code === '605') {
          return this.$message.error('验证码不正确')
        } else if (res.code === '602' || res.code === '603') {
          return this.$message.error(res.message)
        }
        this.$message.success('登录成功')
        sessionStorage.setItem('userInfo', JSON.stringify(res.data))
        this.$router.push('/index')
      })
    },
    async getCode() {
      const res = await this.$http.get(`/createCode`, { responseType: 'arraybuffer' , withCredentials:true}) // 线上
      // const res = await this.$http.get(`http://127.0.0.1:8082/createCode`, { responseType: 'arraybuffer' , withCredentials:true}) // 本地
      const data = 'data:image/png;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
      $('#codeImage').attr('src', data)
    },
  },
}
</script>

<style lang="scss" scoped>
#index {
  height: 100%;
  background: #93defd;
  display: flex;
  justify-content: center;
  align-items: center;
  .el-card {
    width: 50%;
  }
}
.route {
  text-align: right;
  a {
    text-decoration: none;
  }
}
.code-box {
  display: flex;
  align-items: center;
  padding: 0 10px;
}
</style>