<template>
	<div>
		<van-row style="margin-top: 100px;">
			<van-col span="7">
			</van-col>
			<van-col span="10">
				<van-image round width="10rem" height="10rem" show-loading :src="img"> </van-image>
				<h2 style="text-align: center;">乐学童</h2>
			</van-col>
		</van-row>

		<van-cell-group>
			<van-field v-model="phoneNum" type="number" label="手机号" placeholder="请输入手机号" :error-message="phoneNumErr" required />
			<van-field v-model="pwd" type="password" label="密码" placeholder="请输入密码" :error-message="pwdErr" required right-icon="question-o"
			 @click-right-icon="$toast('忘记密码请联系管理员')" />
			<van-button type="info" style="margin-top: 20px;" size="large" @click="login" :loading="isLogining" loading-text="登录中...">
				登 录
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
				code: '',
				img: require('../../img/logo.jpg'),
				phoneNum: '',
				phoneNumErr: '',
				pwd: '',
				pwdErr: '',
				isLogining: false
			}
		},
		created() {
			let that = this
			this.code = getUrlParam('code')
			if (!this.code) {
				Dialog.alert({
					title: '错误',
					message: '请从公众号中打开此页面！'
				})

				// that.$store.commit('setLogin', true)
				// that.$store.commit('setOpenId', 'oVqvvt-PZxlHb-BanjsaTx8LbkzQ')
				// that.$router.push('/task-list')

				return
			}
			axios.get('http://192.168.1.127:8080/openGet?code=' + that.code).then(res => {
				if (res && res.data.responseCode === 200 && res.data.resultData) {
					that.$store.commit('setLogin', true)
					that.$store.commit('setOpenId', res.data.resultData)
					that.$router.push('/task-list')
				} else {
					Dialog.alert({
						title: '未登录',
						message: '未检索到用户数据，请重新登录！'
					})
				}
			}).catch(() => {
				Dialog.alert({
					title: '未登录',
					message: '未检索到用户数据，请重新登录！'
				})
			})
		},
		methods: {
			login() {
				if (!this.code) {
					Dialog.alert({
						title: '错误',
						message: '请从公众号中打开此页面！'
					})
					return
				}
				if (!this.phoneNum || isNaN(this.phoneNum) || this.phoneNum.length != 11) {
					this.phoneNumErr = '手机号格式错误!'
				}
				if (!this.pwd || this.pwd.length != 6) {
					this.pwdErr = '密码格式错误!'
				}
				if (this.phoneNumErr.length > 0 || this.pwdErr.length > 0) {
					return
				}

				this.isLogining = true
				let that = this
				axios.post('http://192.168.1.127:8080/upPhone', {
					code: this.code,
					phone: that.phoneNum,
					veryCode: that.pwd
				}, {
					timeout: 5000
				}).then(res => {
					this.isLogining = false
					if (res && res.data.responseCode === 200) {
						that.$store.commit('setLogin', true)
						console.log(res.data.resultData)
						that.$store.commit('setOpenId', res.data.resultData)
						console.log(that.$store.state.openId)
						that.$router.push('/task-list')
					} else {
						Dialog.alert({
							title: '错误',
							message: '登录失败，请检查手机号和密码！'
						})
					}
				}).catch((err) => {
					this.isLogining = false
					console.error(err)
					Dialog.alert({
						title: '错误',
						message: '系统错误，请稍后再试！'
					})
				})
			}
		}
	}

	function getUrlParam(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
		let url = window.location.href.split('#')[0]
		let search = url.split('?')[1]
		if (search) {
			var r = search.substr(0).match(reg)
			if (r !== null) return unescape(r[2])
			return null
		} else {
			return null
		}
	}
</script>
