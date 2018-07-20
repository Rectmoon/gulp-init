const TODAY = new Date()

export function isDate(o) {
  return Object.prototype.toString.call(o) === '[object Date]'
}

export function toDateString(o, l = '-') {
  let a = [],
    d = isDate(o) ? o : TODAY,
    m = d.getMonth() + 1,
    da = d.getDate()
  a.push(d.getFullYear())
  a.push(m.toString().length < 2 ? '0' + m : m)
  a.push(da.toString().length < 2 ? '0' + da : da)
  return a.join(l)
}

export function toDateTimeString(o) {
  let a = [],
    d = isDate(o) ? o : TODAY,
    h = d.getHours(),
    i = d.getMinutes(),
    s = d.getSeconds()
  a.push(h.toString().length < 2 ? '0' + h : h)
  a.push(i.toString().length < 2 ? '0' + i : i)
  a.push(s.toString().length < 2 ? '0' + s : s)
  return toDateString.apply(null, arguments) + ' ' + a.join(':')
}

export function isLeapYear(year) {
  return 0 == year % 4 && (year % 100 != 0 || year % 400 == 0)
}

export function getSeverDateTime() {
  let xhr = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest()
  xhr.open('HEAD', window.location.href, false)
  xhr.send(null)
  let d = new Date(xhr.getResponseHeader('Date')),
    nowyear = d.getFullYear(),
    locateyear = new Date().getFullYear()
  if (nowyear < locateyear) d = new Date()
  return d
}

export function getWeekOfYear(date, fromMonday = false) {
  let time,
    checkDate = date ? new Date(date) : new Date(),
    d = fromMonday
      ? checkDate.getDate() + 4 - (checkDate.getDay() || 7)
      : checkDate.getDate() + 3 - checkDate.getDay()
  checkDate.setDate(d)
  time = checkDate.getTime()
  checkDate.setMonth(0)
  checkDate.setDate(1)
  return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1
}

export function formatDate(date = TODAY, fmt = 'YYYY-MM-DD hh:ii:ss') {
  if (/(y+)/i.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'i+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`, 'i').test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : ('00' + str).substr(str.length))
    }
  }
  return fmt
}

export function getTimeDetail(timeStr) {
  let _now = +TODAY,
    se = _now - timeStr,
    res = ''
  const DATE_LEVEL = {
    month: 2592000000,
    day: 86400000,
    hour: 3600000,
    minter: 60000
  }
  const handleFn = [
    {
      t: DATE_LEVEL.month,
      fn: timeStr => new Date(timeStr).getMonth() + 1 + '月' + new Date(timeStr).getDate() + '日'
    },
    {
      t: DATE_LEVEL.day,
      fn: timeStr => Math.floor(se / DATE_LEVEL.day) + '天前'
    },
    {
      t: DATE_LEVEL.hour,
      fn: timeStr => Math.floor(se / DATE_LEVEL.hour) + '小时前'
    },
    {
      t: DATE_LEVEL.minter,
      fn: timeStr => Math.ceil(se / DATE_LEVEL.minter) + '分钟前'
    }
  ]
  //求上一年最后一秒的时间戳
  const lastYearTime = new Date(new Date().getFullYear() + '-01-01 00:00:00') - 1
  //把时间差（当前时间戳与上一年最后一秒的时间戳的差）和操作函数添加进去,
  //如果时间差（se）超过这个值，则代表了这个时间是上一年的时间。
  handleFn.unshift({
    t: _now - lastYearTime,
    fn: timeStr => {
      if (se > DATE_LEVEL.month) {
        return (
          new Date(timeStr).getFullYear() +
          '年' +
          (new Date(timeStr).getMonth() + 1) +
          '月' +
          new Date(timeStr).getDate() +
          '日'
        )
      }
    }
  })

  for (let i = 0, len = handleFn.length; i < len; i++) {
    let item = handleFn[i]
    if (se >= item.t) {
      item.fn(timeStr) && (res = item.fn(timeStr))
      if (res) return res
    }
  }
  return '1分钟前'
}
