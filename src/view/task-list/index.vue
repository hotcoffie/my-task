<template>
	<van-pull-refresh v-model="isLoading" @refresh="refresh">
		<div class="header" :style="{backgroundImage: `url(${imgUrl})`}">
			<p>组长：{{groupMaster}}</p>
			<p>{{group}}</p>
			<van-sticky>
				<van-dropdown-menu style="height: 30px;">
					<van-dropdown-item title="日期" ref="dateSelector">
						<van-datetime-picker v-model="currentDate" type="date" @confirm="changeDate" @cancel="$refs.dateSelector.toggle()"></van-datetime-picker>
					</van-dropdown-item>
					<van-dropdown-item title="操作" :disabled="!$store.state.isMaster">
						<van-button block type="default" to="task-edit" :disabled="!$store.state.isMaster">新增作业</van-button>
					</van-dropdown-item>
				</van-dropdown-menu>
			</van-sticky>
		</div>

		<van-notice-bar :text="date + ' 作业'" left-icon="volume-o" color="#1989fa" background="#ecf9ff"></van-notice-bar>
		<task-card :tasks="todayTasks" @click-button="users" @to-detail="toDetail"></task-card>

		<van-notice-bar text="未完成作业" left-icon="info-o"></van-notice-bar>
		<task-card :tasks="unfinishedTasks" @click-button="users" @to-detail="toDetail"></task-card>

		<van-divider :style="{ marginBottom: '70px',color: '#ccc', borderColor: '#ccc', padding: '0 16px' }">
			我是有底线的
		</van-divider>

		<router-view />
		<van-dialog v-model="showDialog" :title="dialogTitle" show-cancel-button>
			<van-cell-group>
				<div v-for="(count,index) in countList" :key="index">
					<van-cell :title="count.name" :value="count.uploadTime"></van-cell>
				</div>
			</van-cell-group>
		</van-dialog>
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
		Tabbar,
		TabbarItem,
		NoticeBar,
		Divider,
		Dialog,
		Sticky,
		Cell,
		CellGroup
	} from 'vant'
	import axios from 'axios'
	import taskCard from '../../components/task-card'

	export default {
		components: {
			[DatetimePicker.name]: DatetimePicker,
			[DropdownMenu.name]: DropdownMenu,
			[DropdownItem.name]: DropdownItem,
			[Button.name]: Button,
			[Sticky.name]: Sticky,
			[Toast.name]: Toast,
			[PullRefresh.name]: PullRefresh,
			[Tabbar.name]: Tabbar,
			[TabbarItem.name]: TabbarItem,
			[Divider.name]: Divider,
			[NoticeBar.name]: NoticeBar,
			[Cell.name]: Cell,
			[CellGroup.name]: CellGroup,
			[Dialog.Component.name]: Dialog.Component,
			taskCard: taskCard
		},
		data() {
			return {
				imgUrl: require("../../img/index-top.jpg"),
				showDialog: false,
				active: 0,
				isLoading: false,
				currentDate: new Date(),
				date: '',
				group: "",
				groupMaster: "",
				todayTasks: [],
				unfinishedTasks: [],
				countList: [],
				dialogTitle: ''
			}
		},
		created() {
			this.refresh()
		},
		methods: {
			refresh() {
				let that = this
				axios.get("/api/getAllTask", {
					params: {
						openId: that.$store.state.openId,
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
						that.$toast.success('查询成功')
						that.isLoading = false
						this.$store.commit('setMaster', info.master)
					} else {
						that.$toast.fail(res.data.responseMsg)
						that.isLoading = false
					}
				}).catch(err => {
					console.error(err)
					that.$toast.fail('请求失败')
					that.isLoading = false
				})
				if (process.env.NODE_ENV === 'development') {
					this.$store.commit('setMaster', true)
				}

			},
			changeDate(picker) {
				let month = (picker.getMonth() + 1).toString().padStart(2, '0');
				let date = picker.getDate().toString().padStart(2, '0');
				//时间格式yyyy-MM-dd
				this.date = `${picker.getFullYear()}-${month}-${date}`

				this.$refs.dateSelector.toggle()
				this.refresh()
			},
			users(query) {
				let that = this
				axios.get("/api/getCountList", {
					params: {
						openId: that.$store.state.openId,
						id: query.id,
						index: query.index
					},
					timeout: 3000
				}).then(res => {
					if (res.data.responseCode === 200) {
						that.dialogTitle = query.title
						that.countList = res.data.resultData
						that.showDialog = true
					} else {
						that.$toast.fail(res.data.responseMsg)
					}
				}).catch(err => {
					console.error(err)
					that.$toast.fail('查询失败')
				})
			},
			toDetail(taskId) {
				this.$router.push( {
					name:'task-detail',
					query: {
						id: taskId
					}
				})
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
</style>
