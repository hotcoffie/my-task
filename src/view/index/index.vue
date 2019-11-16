<template>
  <van-pull-refresh v-model="isLoading" @refresh="refresh">
    <div class="header" :style="{backgroundImage: `url(${imgUrl})`}">
      <p>组长：{{groupMaster}}</p>
      <p>{{group}}</p>
      <van-sticky>
        <van-dropdown-menu style="height: 30px;">
          <van-dropdown-item title="日期" ref="dateSelector">
            <van-datetime-picker v-model="currentDate" type="date"
                                 @confirm="changeDate" @cancel="$refs.dateSelector.toggle()"></van-datetime-picker>
          </van-dropdown-item>
          <van-dropdown-item title="操作" :disabled="!master">
            <van-button block type="default" to="task-edit" :disabled="!master">新增作业</van-button>
          </van-dropdown-item>
        </van-dropdown-menu>
      </van-sticky>
    </div>
    
    <van-notice-bar text="今日作业" left-icon="volume-o" color="#1989fa" background="#ecf9ff"></van-notice-bar>
    
    <div v-for="task in todayTasks" :key="'today'+task.id" style="margin-bottom: 8px;">
      <van-panel :title="task.course" :desc="'截止： '+task.endTime" :status="getStatusName(task.status)">
        <div slot="default" class="content">
          {{task.content}}
        </div>
        <div slot="footer">
          <van-grid :column-num="3" :clickable="true" :border="false">
            <van-grid-item>
              <div slot="text" style="color: cornflowerblue">{{task.num[0]}} 未读</div>
            </van-grid-item>
            <van-grid-item>
              <div slot="text" style="color: crimson">{{task.num[1]}} 未完成</div>
            </van-grid-item>
            <van-grid-item>
              <div slot="text" style="color: green">{{task.num[2]}} 已完成</div>
            </van-grid-item>
          </van-grid>
        </div>
      </van-panel>
    </div>
    
    
    <van-notice-bar text="未完成作业" left-icon="info-o"></van-notice-bar>
    
    <div v-for="task in unfinishedTasks" :key="'unfinished'+task.id" style="margin-bottom: 8px;">
      <van-panel :title="task.course" :desc="'截止： '+task.endTime" :status="getStatusName(task.status)">
        <div slot="default" class="content">
          {{task.content}}
        </div>
        <div slot="footer">
          <van-grid :column-num="3" :clickable="true" :border="false">
            <van-grid-item>
              <div slot="text" style="color: cornflowerblue">{{task.num[0]}} 未读</div>
            </van-grid-item>
            <van-grid-item>
              <div slot="text" style="color: crimson">{{task.num[1]}} 未完成</div>
            </van-grid-item>
            <van-grid-item>
              <div slot="text" style="color: green">{{task.num[2]}} 已完成</div>
            </van-grid-item>
          </van-grid>
        </div>
      </van-panel>
    </div>
    <van-divider :style="{ marginBottom: '70px',color: '#ccc', borderColor: '#ccc', padding: '0 16px' }">
      我是有底线的
    </van-divider>
    <router-view/>
    <van-tabbar v-model="active" route>
      <van-tabbar-item replace to="/index" icon="wap-home-o">我的作业</van-tabbar-item>
      <van-tabbar-item replace to="/user" icon="user-o">个人中心</van-tabbar-item>
    </van-tabbar>
  </van-pull-refresh>
</template>

<script>
import {
  DatetimePicker,
  DropdownMenu,
  DropdownItem,
  Button,
  Toast,
  PullRefresh,
  Grid,
  GridItem,
  Panel,
  Tabbar,
  TabbarItem,
  NoticeBar,
  Divider,
  Sticky
} from 'vant'
import axios from 'axios'

export default {
  components: {
    [DatetimePicker.name]: DatetimePicker,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Toast.name]: Toast,
    [PullRefresh.name]: PullRefresh,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Panel.name]: Panel,
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Divider.name]: Divider,
    [NoticeBar.name]: NoticeBar,
    axios: axios
  },
  data() {
    return {
      imgUrl: require("../../img/index-top.jpg"),
      active: 0,
      isLoading: false,
      currentDate: new Date(),
      date: '',
      group: "",
      groupMaster: "",
      todayTasks: [],
      unfinishedTasks: [],
      master: false
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    refresh() {
      let that = this
      axios.get("http://dwh123.e2.luyouxia.net:20432/getAllTask", {
        params: {
          code: "oVqvvt-PZxlHb-BanjsaTx8LbkzQ",
          date: that.date
        },
        timeout: 3000
      }).then(res => {
        if (res.data.responseCode === 200) {
          let info = res.data.resultData
          that.group = info.group
          that.groupMaster = info.groupMaster
          that.todayTasks = info.taskListVos
          that.unfinishedTasks = info.taskUnfinishVos
          that.master = info.master
          that.$toast.success('查询成功')
          that.isLoading = false
        } else {
          that.$toast.fail(res.data.responseMsg)
          that.isLoading = false
        }
      }).catch(err => {
        console.error(err)
        that.$toast.fail('请求失败')
        that.isLoading = false
      })
    },
    changeDate(picker) {
      let month = (picker.getMonth() + 1).toString().padStart(2, '0');
      let date = picker.getDate().toString().padStart(2, '0');
      //时间格式yyyy-MM-dd
      this.date = `${picker.getFullYear()}-${month}-${date}`

      this.$refs.dateSelector.toggle()
      this.refresh()
    },
    getStatusName(status) {
      switch (status) {
        case 0:
          return "未读"
        case 1:
          return "未完成"
        case 2:
          return "已完成"
      }
    }
  },
  computed: {}
}
</script>

<style scoped>
  .header {
    text-align: right;
    padding-top: 20px;
    background-repeat: no-repeat;
    background-size: cover;
    color: #f8f8f8;
  }
  
  .header p {
    margin: 0 16px 5px 0;
  }
  
  .content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    padding: 0 16px;
    text-align: justify;
    text-justify: inter-ideograph;
  }
</style>
