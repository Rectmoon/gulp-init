export const sum = (...args) => args.reduce((prev, next) => prev + next, 0)

export const getRandom = n => Math.random() * n
