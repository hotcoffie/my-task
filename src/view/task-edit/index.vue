<template>
  <div>
    <van-nav-bar :title="title" left-text="返回" left-arrow @click-left="onClickLeft"></van-nav-bar>
    <van-field style="margin-top: 10px;" readonly clickable label="课程任务" :value="course" placeholder="选择课程任务"
               @click="showCoursePicker = true"></van-field>
    <van-field readonly clickable label="截止时间" :value="endTime" placeholder="选择截止时间"
               @click="showTimePicker = true"></van-field>
    <van-cell-group>
      <van-field v-model="content" rows="15" autosize label="任务内容" type="textarea" maxlength="500" placeholder="请输入任务内容"
                 show-word-limit>
      </van-field>
    </van-cell-group>
    <van-cell-group>
      <van-field label="附件上传">
        <div slot="input" style="padding: 8px;">
          <van-uploader v-model="fileList" multiple :max-count="3" :max-size="20971520" accept="image/*"
                        :after-read="afterRead" :before-delete="beforeDel"></van-uploader>
        </div>
      </van-field>
    </van-cell-group>
    
    
    <van-button type="info" style="margin-top: 10px;" size="large" @click="onClickCommit" :loading="isLoading"
                loading-text="发布中...">
      发布作业
    </van-button>
    
    <van-popup v-model="showCoursePicker" position="bottom">
      <van-picker show-toolbar title="课程任务" :columns="courseArray" @cancel="showCoursePicker = false"
                  @confirm="onCourseConfirm"></van-picker>
    </van-popup>
    <van-popup v-model="showTimePicker" position="bottom">
      <van-datetime-picker title="截止时间" type="datetime" v-model="currentDate" @cancel="showTimePicker = false"
                           @confirm="onDateConfirm"></van-datetime-picker>
    </van-popup>
    <van-overlay :show="isUploading">
      <div class="wrapper" @click.stop>
        <van-loading size="24px">文件上传中...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import {
  Uploader,
  NavBar,
  Popup,
  Picker,
  Field,
  DatetimePicker,
  Cell,
  CellGroup,
  Toast,
  Dialog,
  Overlay,
  Loading,
  Button
} from 'vant'

import axios from 'axios'

export default {
  components: {
    [Uploader.name]: Uploader,
    [NavBar.name]: NavBar,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [DatetimePicker.name]: DatetimePicker,
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Overlay.name]: Overlay,
    [Loading.name]: Loading,
    [Toast.name]: Toast
  },
  data() {
    return {
      taskId: -1,
      title: '',
      course: '',
      courseCode: 0,
      showCoursePicker: false,
      courseArray: ['语文', '数学', '英语', '体育', '会议提醒', '必带课本', '其他'],
      endTime: '',
      showTimePicker: false,
      currentDate: new Date(),
      content: '',
      files: [],
      fileList: [],
      isLoading: false,
      isUploading: false,
      qiniuToken: ''
    }
  },
  created() {
    this.taskId = this.$route.query.id ? this.$route.query.id : -1
    if (this.taskId > 0) {
      this.title = "编辑作业"

      let that = this
      axios.get('/api/getTaskDetail', {
        params: {
          openId: that.$store.state.openId,
          id: that.taskId
        },
        timeout: 3000
      }).then(res => {
        if (res.data.responseCode === 200) {
          let info = res.data.resultData
          that.endTime = info.endTime
          that.course = info.course
          that.courseCode = info.type
          that.content = info.content
          that.signalId = info.id
          that.files = info.taskFiles
          info.taskFiles.forEach((value) => {
            that.fileList.push({
              url: that.$store.state.picUrl + "/" + value.path + '?imageView2/2/w/1000',
              isImage: value.type.startsWith('image/'),
              fileId: value.id
            })
          })
        } else {
          Dialog.alert({
            title: '失败',
            message: res.data.responseMsg
          }).then(() => {
            if (res.data.responseCode === 501) {
              that.$router.push('bind')
            } else {
              this.$router.go(-1)
            }
          })
        }
      })
    } else {
      this.title = "新建作业"
    }
  },
  methods: {
    onCourseConfirm(picker, index) {
      this.course = picker;
      this.courseCode = index + 1
      this.showCoursePicker = false;
    },
    onDateConfirm(picker) {
      let M = (picker.getMonth() + 1).toString().padStart(2, '0');
      let d = picker.getDate().toString().padStart(2, '0');
      let h = picker.getHours().toString().padStart(2, '0');
      let m = picker.getMinutes().toString().padStart(2, '0');
      //时间格式yyyy-MM-dd hh:mm
      this.endTime = `${picker.getFullYear()}-${M}-${d} ${h}:${m}`
      this.showTimePicker = false;
    },
    onClickLeft() {
      this.$router.go(-1)
    },
    onClickCommit() {
      let that = this
      if (that.courseCode < 0 || !that.endTime || !that.content) {
        Dialog.alert({
          title: '错误',
          message: '请完善作业信息！'
        })
        return
      }
      that.isLoading = true
      axios.post('/api/uploadHomework', {
        openId: that.$store.state.openId,
        id: that.taskId,
        type: that.courseCode,
        content: that.content,
        endTime: that.endTime,
        files: that.files
      }, {
        timeout: 3000
      }).then(res => {
        if (res.data.responseCode === 200) {
          that.isLoading = false
          Dialog.alert({
            title: '成功',
            message: '作业发布成功！'
          }).then(() => {
                that.$router.go(-1)
              }
          )
        } else {
          Dialog.alert({
            title: '错误',
            message: res.data.responseMsg
          }).then(() => {
            if (res.data.responseCode === 501) {
              that.$router.push('bind')
            }
          })
          that.isLoading = false
        }
      }).catch(err => {
        console.error(err)
        that.isLoading = false
        Dialog.alert({
          title: '失败',
          message: '作业发布失败！'
        })
      })
    },
    afterRead(file, detail) {
      let that = this
      that.isUploading = true
      const axiosInstance = axios.create({withCredentials: false});    //withCredentials 禁止携带cookie，带cookie在七牛上有可能出现跨域问题
      let data = new FormData();
      data.append('token', that.$store.state.picToken);
      data.append('file', file.file);
      axiosInstance({
        method: 'POST',
        url: 'http://upload-z1.qiniup.com/',  //上传地址
        data: data,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,      //超时时间，因为图片上传有可能需要很久
      }).then(data => {
        that.isUploading = false
        that.files.push({
          fileName: file.file.name,
          type: file.file.type,
          path: data.data.key
        })
      }).catch((err) => {
        console.error(err)
        that.isUploading = false
        Dialog.alert({
          title: '错误',
          message: '上传失败'
        }).then(() => {
          that.fileList.splice(detail.index, 1)
        })
        if (err.response.data.error.indexOf('token') > -1) {
          that.queryToken()
        }
      });
    },
    queryToken() {
      let that = this
      axios.get('/api/token')
          .then((res) => {
            if (res.data.responseCode === 200) {
              that.$store.commit('setPicToken', res.data.resultData)
            } else {
              Dialog.alert({
                title: '错误',
                message: res.data.responseMsg
              }).then(() => {
                if (res.data.responseCode === 501) {
                  that.$router.push('bind')
                }
              })
            }
          })
    },
    beforeDel(data) {
      let that = this
      return new Promise((resolve, reject) => {
            Dialog.confirm({
              title: '删除附件',
              message: '确认删除这个附件吗？'
            }).then(() => {
              axios.post('/api/fleDelete?id=' + data.fileId).then((res) => {
                    if (res.data.responseCode === 200) {
                      that.files.splice(data.index, 1)
                      resolve(true)
                    } else {
                      Dialog.alert({
                        title: '删除附件',
                        message: res.data.responseMsg
                      }).then(() => {
                        reject(false)
                        if (res.data.responseCode === 501) {
                          that.$router.push('bind')
                        }
                      })
                    }
                  }
              ).catch(err => {
                console.error(err)
                Dialog.alert({
                  title: '删除附件',
                  message: '删除失败，请稍后再试？'
                }).then(() => {
                  reject(false)
                })
              });
            }).catch(() => {
              reject(false)
            });
          }
      )
    }
  }
}
</script>

<style scoped>

</style>
