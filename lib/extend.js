const oproto = Object.prototype

function getParamType(o) {
  return o === null
    ? String(o)
    : oproto.toString
        .call(o)
        .replace(/\[object\s+(\w+)\]/i, '$1')
        .toLowerCase()
}

function isPlaneObject(o) {
  return getParamType(o) === 'object' && Object.getPrototypeOf(o) === oproto
}

function isFunction(o) {
  return getParamType(o) === 'function'
}

function isArray(o) {
  return getParamType(o) === 'array'
}

function extend() {
  let options,
    name,
    src,
    copy,
    copyisArray,
    clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false

  // 如果第一个参数为布尔,判定是否深拷贝
  if (typeof target === 'boolean') {
    deep = target
    target = arguments[1] || {}
    i++
  }
  // 确保接受方为一个复杂的数据类型
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {}
  }
  if (i === length) {
    target = this
    i--
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) !== null) {
      for (name in options) {
        src = target[name]
        copy = options[name]
        if (target === copy) continue
        if (deep && copy && (isPlaneObject(copy) || (copyisArray = isArray(copy)))) {
          if (copyisArray) {
            copyisArray = false
            clone = src && isArray(src) ? src : []
          } else {
            clone = src && isPlaneObject(src) ? src : {}
          }
          target[name] = extend(deep, clone, copy)
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
  }
  return target
}

export default extend
