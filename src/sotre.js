import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  isMaster: false,
  isLogin: false,
  openId: '',
  picToken: '',
  picUrl:''
}
const mutations = {
  setMaster(state, value) {
    state.isMaster = value
  },
  setLogin() {
    state.isLogin = true
  },
  setOpenId(state, value) {
    state.openId = value
  },
  setPicToken(state, value) {
    state.picToken = value
  },
  setPicUrl(state, value) {
    state.picUrl = value
  }
}
const getters = {}
const store = new Vuex.Store({
  state,
  mutations,
  getters
})

export {
  store
}
