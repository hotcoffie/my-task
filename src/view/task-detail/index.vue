<template>
  <div>
    <van-nav-bar title="作业详情" left-text="返回" left-arrow @click-left="onClickLeft"></van-nav-bar>
    <van-panel :title="course" :desc="'截止： '+endTime">
      <div slot="default" class="content">
        {{content}}
      </div>
    </van-panel>
    <van-row type="flex" justify="space-around">
      <van-col span="6" v-for="(file,index) in taskFiles" :key="file.id">
        <van-image
            v-if="file.isImage"
            width="100"
            height="100"
            :src="file.url"
            @click="showPic(index)"></van-image>
      </van-col>
    </van-row>
    
    <van-button v-if="$store.state.isMaster" type="default" block :to="{name:'task-edit',query:{id:taskId}}"
                style="margin:20px 0;">修改
    </van-button>
    
    <van-cell-group>
      <van-field label="上传作业">
        <div slot="input" style="padding: 8px;">
          <van-uploader v-model="overFiles" multiple :max-count="3" :max-size="20971520" accept="image/jpeg"
                        :after-read="afterRead" :before-delete="beforeDel"></van-uploader>
        </div>
      </van-field>
    </van-cell-group>
    <van-button :type="statusColor" block @click="changeStatus" style="margin-bottom: 10px;">{{statusName}}</van-button>
    <van-overlay :show="isUploading"></van-overlay>
  </div>
</template>

<script>
import {
  Button,
  NavBar,
  Field,
  Cell,
  CellGroup,
  Uploader,
  Dialog,
  Overlay,
  Image,
  Row,
  Col,
  ImagePreview,
  Panel
} from 'vant';

import axios from 'axios';

export default {
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Image.name]: Image,
    [Button.name]: Button,
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Uploader.name]: Uploader,
    [Overlay.name]: Overlay,
    [Panel.name]: Panel
  },
  data() {
    return {
      taskId: -1,
      endTime: '',
      course: '',
      content: '',
      status: 1,
      signalId: -1,
      isUploading: false,
      taskImgs: [],
      taskFiles: [],
      overFiles: []
    }
  },
  created() {
    this.taskId = this.$route.query.id
    if (!this.taskId) {
      this.$router.go(-1)
    }
    let that = this
    axios.get('/api/getTaskDetail', {
      params: {
        openId: that.$store.state.openId,
        id: this.taskId
      },
      timeout: 3000
    }).then(res => {
      if (res.data.responseCode === 200) {
        let info = res.data.resultData
        that.endTime = info.endTime
        that.course = info.course
        that.content = info.content
        that.status = info.status
        that.signalId = info.id
        info.taskFiles.forEach(value => {
          that.taskFiles.push({
            url: that.$store.state.picUrl + "/" + value.path,
            isImage: value.type.startsWith('image/'),
            fileId: value.id
          })
          that.taskImgs.push(that.$store.state.picUrl + "/" + value.path)
        })
        info.overFiles.forEach(value => {
          that.overFiles.push({
            url: that.$store.state.picUrl + "/" + value.path,
            isImage: value.type.startsWith('image/'),
            fileId: value.id
          })
        })
      } else {
        Dialog.alert({
          title: '失败',
          message: res.data.responseMsg
        }).then(() => {
          this.$router.go(-1)
        })
      }
    })
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    changeStatus() {
      let status = 2
      if (this.status === 2) {
        status = 3
      }
      let that = this
      axios.post('/api/updateTask', {
        openId: that.$store.state.openId,
        id: that.signalId,
        status: status
      }, {
        timeout: 3000
      }).then(res => {
        if (res.data.responseCode === 200) {
          that.status = status
          Dialog.alert({
            title: '成功',
            message: '作业状态修改成功！'
          })
        } else {
          Dialog.alert({
            title: '失败',
            message: '作业状态修改失败！'
          })
        }
      })
    },
    afterRead(file, detail) {
      let that = this
      that.isUploading = true
      const axiosInstance = axios.create({withCredentials: false});
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
        that.updateTask(file, data.data.key)
      }).catch((err) => {
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
    updateTask(file, path) {
      let that = this
      axios.post('/api/taskUpload', {
        fileName: file.file.name,
        type: file.file.type,
        path: path,
        bussId: this.signalId
      }, {
        timeout: 3000
      }).then((res => {
        if (res.data.responseCode === 200) {
          that.status = status
          file.fileId = res.data.resultData
          Dialog.alert({
            title: '成功',
            message: '作业上传成功！'
          })
        } else {
          Dialog.alert({
            title: '失败',
            message: '作业上传失败！'
          })
        }
        that.isUploading = false
      })).catch(err => {
        console.error(err)
        that.isUploading = false
      })
    },
    queryToken() {
      let that = this
      axios.get('/api/token')
          .then((res) => {
            if (res.data.responseCode === 200) {
              that.$store.commit('setPicToken', res.data.resultData)
            }
          })
    },
    beforeDel(data) {
      return new Promise((resolve, reject) => {
            Dialog.confirm({
              title: '删除附件',
              message: '确认删除这个附件吗？'
            }).then(() => {
              axios.post('/api/fleDelete?id=' + data.fileId).then((res) => {
                    if (res.data.responseCode === 200) {
                      resolve(true)
                    } else {
                      Dialog.alert({
                        title: '删除附件',
                        message: '删除失败，请稍后再试？'
                      }).then(() => {
                        reject(false)
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
    },
    showPic(index) {
      ImagePreview({
        images: this.taskImgs,
        onClose() {
          // do something
        },
        startPosition: index
      });
    }
  },
  computed: {
    statusName() {
      return this.status === 2 ? '标记已完成' : '标记未完成'
    },
    statusColor() {
      return this.status === 2 ? 'primary' : 'info'
    }
  }
}
</script>

<style scoped>
  .content {
    min-height: 200px;
    padding: 0 16px;
    text-align: justify;
    text-justify: inter-ideograph;
  }
</style>
