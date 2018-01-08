module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
      sourceType: 'module'
    },
    env: {
      browser: true,
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // required to lint *.vue files
    plugins: [
      'html'
    ],
    // add your custom rules here
    'rules': {
      // allow paren-less arrow functions
      'arrow-parens': 0,
      // allow async-await
      'generator-star-spacing': 0,
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
      'object-shorthand': 1,
      'prefer-const': 1,
      'no-const-assign': 1,
      'no-var': 1,
      'no-new-object': 1,
      'prefer-template': 1,
      'template-curly-spacing': 1,
      'quotes': 1,
      'quote-props': 0,
      'no-array-constructor': 1,
      'array-callback-return': 1,
      'no-useless-escape': 1,
      'func-style': 1,
      'no-loop-func': 1,
      'prefer-rest-params': 1,
      'no-new-func': 1,
      'space-before-function-paren': 1,
      'no-param-reassign': 1,
      'prefer-spread': 1,
      'no-confusing-arrow': 1,
      'no-useless-constructor': 1,
      'no-dupe-class-members': 1,
      'no-duplicate-imports': 1,
      'no-restricted-syntax': 1,
      'dot-notation': 1,
      'no-undef': 1,
      'one-var': 1,
      //'no-plusplus': 1
      'eqeqeq': 1,
      'no-case-declarations': 1,
      'no-nested-ternary': 1,
      'no-unneeded-ternary': 1,
      'brace-style': 1,
      'newline-per-chained-call': 1,
      'no-whitespace-before-property': 1,
      'padded-blocks': 1,
      'space-in-parens': 1,
      'array-bracket-spacing': 1,
      'object-curly-spacing': 1,
      //allows claner diffs
      'comma-dangle': 0,
      'radix': 1,
      'semi': ['warn', 'always'],
      'camelcase': 1,
      'new-cap': 1,
      'no-underscore-dangle': 1,
      //doesn't work as intended
      'no-trailing-spaces': 0,
      'yoda': 0
    }
  }
  