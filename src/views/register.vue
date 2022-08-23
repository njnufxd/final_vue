<template>
  <div id="index">
    <el-card>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerRef"
        label-width="80px"
      >
        <h2>物品交换系统注册</h2>
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="registerForm.userName"
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="pwd">
          <el-input
            type="password"
            v-model="registerForm.pwd"
            autocomplete="off"
            show-password
            placeholder="请输入密码"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="checkPwd">
          <el-input
            type="password"
            v-model="registerForm.checkPwd"
            autocomplete="off"
            show-password
            placeholder="请确认密码"
            clearable
          ></el-input>
        </el-form-item>

        <el-button type="primary" class="submit" @click="register"
          >注册</el-button
        >
        <div class="route">
          <router-link to="/login">已有账号？前往登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (this.registerForm.checkPwd !== "") {
        this.$refs.registerRef.validateField("checkPwd");
      }
      callback();
    };
    var validatePass2 = (rule, value, callback) => {
      if (value !== this.registerForm.pwd) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      registerForm: {
        userName: "",
        pwd: "",
        checkPwd: "",
      },
      registerRules: {
        userName: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        pwd: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码长度在 6 到 15 个字符",
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur" },
        ],
        checkPwd: [{ validator: validatePass2, trigger: "blur" }],
      },
    };
  },
  created() {},
  methods: {
    async register() {
      this.$refs.registerRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        
        const { data: res } = await this.$http.post(
          `/api/user/reg`, // 线上
          // `http://127.0.0.1:8082/api/user/reg`, // 本地
          this.$qs.stringify({
            userName: this.registerForm.userName,
            pwd: this.registerForm.pwd,
          }),
          {withCredentials:true}
        );
        if (res.code === "602") {
          return this.$message.error("该用户已经存在");
        }
        this.$message.success("注册成功");
        this.$router.push("/login");
      });
    },
  },
};
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
</style>