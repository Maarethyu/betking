// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    /* MOCHA */
    "describe"   : false,
    "it"         : false,
    "before"     : false,
    "beforeEach" : false,
    "after"      : false,
    "afterEach"  : false
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'object-shorthand': 2,
    'prefer-const': 2,
    'no-const-assign': 2,
    'no-var': 2,
    'no-new-object': 2,
    'prefer-template': 2,
    'template-curly-spacing': 2,
    'quotes': 2,
    'quote-props': 0,
    'no-array-constructor': 2,
    'array-callback-return': 2,
    'no-useless-escape': 2,
    'func-style': 2,
    'no-loop-func': 2,
    'prefer-rest-params': 2,
    'no-new-func': 2,
    'space-before-function-paren': 2,
    'no-param-reassign': 2,
    'prefer-spread': 2,
    'no-confusing-arrow': 2,
    'no-useless-constructor': 2,
    'no-dupe-class-members': 2,
    'no-duplicate-imports': 2,
    'no-restricted-syntax': 2,
    'dot-notation': 2,
    'no-undef': 2,
    'one-var': 2,
    //'no-plusplus': 2
    'eqeqeq': 2,
    'no-case-declarations': 2,
    'no-nested-ternary': 2,
    'no-unneeded-ternary': 2,
    'brace-style': 2,
    'newline-per-chained-call': 2,
    'no-whitespace-before-property': 2,
    'padded-blocks': 2,
    'space-in-parens': 2,
    'array-bracket-spacing': 2,
    'object-curly-spacing': 2,
    //allows claner diffs
    'comma-dangle': 0,
    'radix': 2,
    'semi': ['warn', 'always'],
    'camelcase': 2,
    'new-cap': 2,
    'no-underscore-dangle': 2,
    //doesn't work as intended
    'no-trailing-spaces': 0,
    'yoda': 0
  }
}
