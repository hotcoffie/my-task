function getUrlParam(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let url = window.location.href.split('#')[0]
  let search = url.split('?')[1]
  if (search) {
    let r = search.substr(0).match(reg)
    if (r !== null) {
      return unescape(r[2])
    }
  }
  return null
}

export {
  getUrlParam
}
