<template>
  <div>
    <div v-for="task in tasks" :key="task.id" style="margin-bottom: 8px;">
      <van-panel :title="task.course" :desc="'截止： '+task.endTime" @click="toDetail(task.id)">
        <div slot="default" class="content">
          {{task.content}}
        </div>
        <div slot="footer">
          <van-row type="flex" justify="space-around">
            <van-col span="6" @click.stop="showList(task.id,0)" style="color: cornflowerblue">
              {{task.num[0]}} 未读
            </van-col>
            <van-col span="6" @click.stop="showList(task.id,1)" style="color: crimson">
              {{task.num[1]}} 未完成
            </van-col>
            <van-col span="6" @click.stop="showList(task.id,2)" style="color: green">
              {{task.num[2]}} 已完成
            </van-col>
          </van-row>
        </div>
      </van-panel>
    </div>
  </div>
</template>

<script>
  import {
    Panel,
    Row,
    Col
  } from 'vant';

  export default {
    name: "task-card",
    components: {
      [Panel.name]: Panel,
      [Row.name]: Row,
      [Col.name]: Col
    },
    props: {
      tasks: {
        type: Array
      }
    },
    methods: {
      showList(taskId, index) {
        this.$emit("click-button", {
          id: taskId,
          index: index + 1,
          title: getStatusName(index)
        })
      },
      toDetail(taskId) {
        this.$emit("to-detail", taskId)
      }
    }
  }

  function getStatusName(status) {
    switch (status) {
      case 0:
        return "未读"
      case 1:
        return "未完成"
      case 2:
        return "已完成"
    }
  }
</script>

<style scoped>
  .van-cell__title span {
    font-size: 18px;
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
    font-size: 15px;
  }
</style>
