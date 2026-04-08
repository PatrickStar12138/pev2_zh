export function time_ago(time) {
  switch (typeof time) {
    case "number":
      break
    case "string":
      time = +new Date(time)
      break
    case "object":
      if (time.constructor === Date) time = time.getTime()
      break
    default:
      time = +new Date()
  }
  const time_formats = [
    [60, "刚刚", ""], // 60
    [120, "1 分钟前", "1 分钟后"], // 60*2
    [3600, "分钟", 60], // 60*60, 60
    [7200, "1 小时前", "1 小时后"], // 60*60*2
    [86400, "小时", 3600], // 60*60*24, 60*60
    [172800, "昨天", "明天"], // 60*60*24*2
    [604800, "天", 86400], // 60*60*24*7, 60*60*24
    [1209600, "上周", "下周"], // 60*60*24*7*4*2
    [2419200, "周", 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, "上个月", "下个月"], // 60*60*24*7*4*2
    [29030400, "个月", 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, "去年", "明年"], // 60*60*24*7*4*12*2
    [2903040000, "年", 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
  ]
  let seconds = (+new Date() - time) / 1000,
    token = "前",
    list_choice = 1

  if (seconds == 0) {
    return "刚刚"
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds)
    token = "后"
    list_choice = 2
  }
  let i = 0,
    format: (string | number)[]
  while ((format = time_formats[i++]))
    if (seconds < format[0]) {
      if (typeof format[2] == "string") return format[list_choice]
      else {
        return Math.floor(seconds / format[2]) + " " + format[1] + token
      }
    }
  return time
}
