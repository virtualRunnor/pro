//formData 工具
export const formDataUtil = (obj) => {
  const fd = new FormData()
  for (let key in obj) {
    fd.append(key, obj[key])
  }
  return fd
}
