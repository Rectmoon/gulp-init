// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  extends: 'airbnb-base',
  // add your custom rules here
  rules: {
    'no-undef': 0,
    'no-var': 0,
    'no-extend-native': 0,
    'no-param-reassign': 0, //禁止给参数重新赋值,
    'no-restricted-syntax': 0, //使用用for-in for-of
    'vars-on-top': 0,
    'func-names': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // allow console during development
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
    'eol-last': 0,
    'space-before-function-paren': 0,
    semi: 0,
    // off或0: 禁用规则
    'linebreak-style': 0
  },
  globals: {
    document: true,
    location: true,
    window: true
  }
}
