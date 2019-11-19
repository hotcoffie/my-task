<template>
	<div>
		<div v-for="task in tasks" :key="task.id" style="margin-bottom: 8px;">
			<van-panel :title="task.course" :desc="'截止： '+task.endTime" @click="toDetail(task.id)">
				<div slot="default" class="content">
					{{task.content}}
				</div>
				<div slot="footer">
					<van-grid :column-num="3" :clickable="true" :border="false">
						<van-grid-item @click.stop="showList(task.id,0)">
							<div slot="text" style="color: cornflowerblue">{{task.num[0]}} 未读</div>
						</van-grid-item>
						<van-grid-item @click.stop="showList(task.id,1)">
							<div slot="text" style="color: crimson">{{task.num[1]}} 未完成</div>
						</van-grid-item>
						<van-grid-item @click.stop="showList(task.id,2)">
							<div slot="text" style="color: green">{{task.num[2]}} 已完成</div>
						</van-grid-item>
					</van-grid>
				</div>
			</van-panel>
		</div>
	</div>
</template>

<script>
	import {
		Panel,
		Grid,
		GridItem
	} from 'vant';

	export default {
		name: "task-card",
		components: {
			[Panel.name]: Panel,
			[Grid.name]: Grid,
			[GridItem.name]: GridItem
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
