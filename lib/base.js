const oproto = Object.prototype

export function getType(o) {
  return oproto.toString
    .call(o)
    .slice(8, -1)
    .toLowerCase()
}

export const isNull = o => getType(o) === 'null'
export const isUndefined = o => getType(o) === 'undefined'
export const isBoolean = o => getType(o) === 'boolean'
export const isFunction = o => getType(o) === 'function'
export const isArray = o => getType(o) === 'array'
export const isString = o => getType(o) === 'string'
export const isNumber = o => getType(o) === 'number'
export const isObject = o => getType(o) === 'object'
export function isPlaneObject(o) {
  return getType(o) === 'object' && Object.getPrototypeOf(o) === oproto
}
