import { getType } from './base'

const LEADING_UNDERSCORE_REGEXP = /^\_+/g
const SNAKECASE_PAIR = /\_+[A-Za-z0-9]/g

/**
 * 下划线转驼峰
 * @param {String}
 * @return {String}
 */
function snakeToCamel(str = '') {
  let leadingUnderscore = (str.match(LEADING_UNDERSCORE_REGEXP) || [])[0] || ''
  return (
    leadingUnderscore +
    str
      .replace(LEADING_UNDERSCORE_REGEXP, '')
      .replace(SNAKECASE_PAIR, function(m) {
        return m[m.length - 1].toUpperCase()
      })
  )
}

const LEADING_CAPITAL_WORD = /^[A-Z]+/
const CAMELCASE_PAIR = /\.?([A-Z]+)/g

/**
 * 驼峰转下划线
 * @param {String}
 * @return {String}
 */

function camelToSnake(str = '') {
  return str
    .replace(LEADING_CAPITAL_WORD, function(m) {
      return m.toLowerCase()
    })
    .replace(CAMELCASE_PAIR, function(_, c) {
      return '_' + c.toLowerCase()
    })
}

function convertorGenerator(convertor) {
  return function f(obj) {
    if (getType(obj) === 'object') {
      return Object.keys(obj).reduce(function(output, key) {
        output[convertor(key)] = f(obj[key])
        return output
      }, {})
    }
    if (getType(obj) === 'array') {
      return obj.map(f)
    }
    return obj
  }
}

function getValueByName(url, name) {
  var reg = new RegExp('(?|&)' + name + '=([^&?]*)', 'i')
  var arr = url.match(reg)
  if (arr) return unescape(arr[2])
  return null
}

const camelKeys = convertorGenerator(snakeToCamel)
const snakeKeys = convertorGenerator(camelToSnake)

export { snakeToCamel, camelToSnake, camelKeys, snakeKeys, getValueByName }
