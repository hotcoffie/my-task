<template>
  <div>
    <van-row style="margin-top: 100px;">
      <van-col span="7">
      </van-col>
      <van-col span="10">
        <van-image round width="10rem" height="10rem" show-loading :src="img"></van-image>
        <h2 style="text-align: center;">作业侠</h2>
      </van-col>
    </van-row>
    
    <van-cell-group>
      <van-field v-model="phoneNum" type="number" label="手机号" placeholder="请输入手机号" :error-message="phoneNumErr"
                 required></van-field>
      <van-field v-model="pwd" type="password" label="邀请码" placeholder="请输入邀请码" :error-message="pwdErr" required
                 right-icon="question-o"
                 @click-right-icon="$toast('忘记邀请码请联系管理员')"></van-field>
      <van-button type="info" style="margin-top: 20px;" size="large" @click="login" :loading="isLogining"
                  loading-text="绑定中...">
        绑 定
      </van-button>
    </van-cell-group>
  </div>
</template>
<script>
import {
  Dialog,
  Image,
  Row,
  Col,
  Field,
  CellGroup,
  Toast,
  Button
} from 'vant';
import axios from 'axios';

export default {
  components: {
    [Button.name]: Button,
    [Image.name]: Image,
    [Row.name]: Row,
    [Col.name]: Col,
    [Field.name]: Field,
    [Toast.name]: Toast,
    [CellGroup.name]: CellGroup
  },
  data() {
    return {
      img: require('../../img/logo.jpg'),
      phoneNum: '',
      phoneNumErr: '',
      pwd: '',
      pwdErr: '',
      isLogining: false
    }
  },
  methods: {
    login() {
      //缓存没有openId则重新向腾讯请求
      let openId = this.$store.state.openId
      if (!openId) {
        window.location.href = '/api/noCode'
      }
      this.phoneNumErr = ''
      this.pwdErr = ''
      if (!this.phoneNum || isNaN(this.phoneNum) || this.phoneNum.length !== 11) {
        this.phoneNumErr = '手机号格式错误!'
      }
      if (!this.pwd || this.pwd.length !== 6) {
        this.pwdErr = '邀请码格式错误!'
      }
      if (this.phoneNumErr.length > 0 || this.pwdErr.length > 0) {
        return
      }

      this.isLogining = true
      let that = this
      axios.post('/api/upPhone', {
        openId: openId,
        phone: that.phoneNum,
        veryCode: that.pwd
      }, {
        timeout: 5000
      }).then(res => {
        this.isLogining = false
        if (res && res.data.responseCode === 200) {
          that.$store.commit('setLogin', true)
          this.$router.replace('task-list')
        } else {
          Dialog.alert({
            title: '错误',
            message: res.data.responseMsg
          })
        }
      }).catch((err) => {
        this.isLogining = false
        console.error(err)
        Dialog.alert({
          title: '错误',
          message: '系统错误，请尝试刷新或重新打开页面'
        })
      })
    }
  }
}

</script>
