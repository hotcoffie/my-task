<template>
	<div>
		<van-nav-bar title="作业详情" left-text="返回" left-arrow @click-left="onClickLeft"></van-nav-bar>
		<van-panel :title="course" :desc="'截止： '+endTime">
			<div slot="default" class="content">
				{{content}}
			</div>
		</van-panel>
		<van-button v-if="$store.state.isMaster" type="default" block :to="{name:'task-edit',query:{id:taskId}}" style="margin:20px 0;">修改</van-button>

		<van-cell-group>
			<van-field label="附件上传">
				<div slot="input" style="padding: 8px;">
					<van-uploader v-model="fileArray" multiple :max-count="2" accept="*"></van-uploader>
				</div>
			</van-field>
		</van-cell-group>
		<van-button :type="statusColor" block @click="changeStatus" style="margin-bottom: 10px;">{{statusName}}</van-button>
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
		Panel
	} from 'vant';

	import axios from 'axios';

	export default {
		components: {
			[Button.name]: Button,
			[NavBar.name]: NavBar,
			[Field.name]: Field,
			[Cell.name]: Cell,
			[CellGroup.name]: CellGroup,
			[Uploader.name]: Uploader,
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
				fileArray: []
			}
		},
		created() {
			this.taskId = this.$route.query.id
			if (!this.taskId) {
				this.$router.go(-1)
			}
			let that = this
			axios.get('http://192.168.1.127:8080/getTaskDetail', {
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
				if (this.status == 2) {
					status = 3
				}
				let that = this
				axios.post('http://192.168.1.127:8080/updateTask', {
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
			}
		},
		computed: {
			statusName() {
				return this.status == 2 ? '标记已完成' : '标记未完成'
			},
			statusColor() {
				return this.status == 2 ? 'primary' : 'info'
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
