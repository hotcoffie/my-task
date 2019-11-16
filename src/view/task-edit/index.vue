<template>
  <div>
    <van-nav-bar
        :title="title"
        left-text="返回"
        left-arrow
        @click-left="onClickLeft"></van-nav-bar>
    <van-field
        style="margin-top: 10px;"
        readonly
        clickable
        label="课程"
        :value="course"
        placeholder="选择课程"
        @click="showCoursePicker = true"></van-field>
    <van-field
        readonly
        clickable
        label="截止时间"
        :value="endTime"
        placeholder="选择截止时间"
        @click="showTimePicker = true"></van-field>
    <van-cell-group>
      <van-field
          v-model="content"
          rows="15"
          autosize
          label="任务内容"
          type="textarea"
          maxlength="500"
          placeholder="请输入任务内容"
          show-word-limit></van-field>
    </van-cell-group>
    <van-cell-group>
      <van-field label="附件上传">
        <div slot="input" style="padding: 8px;">
          <van-uploader v-model="fileArray" multiple :max-count="2" accept="*"></van-uploader>
        </div>
      </van-field>
    </van-cell-group>
    
    
    <van-button type="info" style="margin-top: 10px;" size="large" @click="onClickCommit"
                :loading="isLoading"
                loading-text="发布中...">
      发布作业
    </van-button>
    
    <van-popup v-model="showCoursePicker" position="bottom">
      <van-picker
          show-toolbar
          title="课程"
          :columns="courseArray"
          @cancel="showCoursePicker = false"
          @confirm="onCourseConfirm"></van-picker>
    </van-popup>
    <van-popup v-model="showTimePicker" position="bottom">
      <van-datetime-picker
          title="截止时间"
          type="datetime"
          v-model="currentDate"
          @cancel="showTimePicker = false"
          @confirm="onDateConfirm"></van-datetime-picker>
    </van-popup>
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
    [Toast.name]: Toast,
    axios: axios
  },
  data() {
    return {
      taskId: -1,
      title: '',
      course: '',
      courseCode: 0,
      showCoursePicker: false,
      courseArray: ['语文', '数学', '外语', '体育', '会议'],
      endTime: '',
      showTimePicker: false,
      currentDate: new Date(),
      content: '',
      fileArray: [],
      isLoading: false
    }
  },
  created() {
    this.taskId = this.$route.query.id ? this.$route.query.id : -1
    if (this.taskId <= 0) {
      this.title = "新建作业"
    } else {
      this.title = "编辑作业"
    }
  },
  methods: {
    onCourseConfirm(picker, index) {
      this.course = picker;
      this.courseCode = index
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
      that.isLoading = true
      axios.post('http://dwh123.e2.luyouxia.net:20432/getAllTask', {
        code: "oVqvvt-PZxlHb-BanjsaTx8LbkzQ",
        openId: "oVqvvt-PZxlHb-BanjsaTx8LbkzQ",
        content: that.content,
        endDate: "string",
        id: that.taskId,
        remindTime: that.remindTime
      }, {
        timeout: 3000
      }).then(res => {
        if (res.data.responseCode === 200) {
          that.$toast.success('发布成功')
          that.isLoading = false
        } else {
          that.$toast.fail(res.data.responseMsg)
          that.isLoading = false
        }
      }).catch(err => {
        console.error(err)
        that.$toast.fail('发布失败')
        that.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
