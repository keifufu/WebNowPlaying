// pnpm i eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import eslint-plugin-tailwindcss -D
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended'
  ],
  env: {
    node: true,
    jest: true,
    browser: true
  },
  globals: {
    NodeJS: true,
    chrome: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-var-requires': [
      'off'
    ],
    '@typescript-eslint/interface-name-prefix': [
      'off'
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'off'
    ],
    '@typescript-eslint/explicit-module-boundary-types': [
      'off'
    ],
    '@typescript-eslint/no-explicit-any': [
      'off'
    ],
    '@typescript-eslint/indent': [
      'warn',
      2
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'none'
      }
    ],
    quotes: [
      'warn',
      'single'
    ],
    'for-direction': [
      'warn'
    ],
    'getter-return': [
      'warn'
    ],
    'no-async-promise-executor': [
      'off'
    ],
    'no-await-in-loop': [
      'off'
    ],
    'no-compare-neg-zero': [
      'warn'
    ],
    'no-cond-assign': [
      'warn'
    ],
    'no-console': [
      'off'
    ],
    'no-constant-condition': [
      'warn'
    ],
    'no-control-regex': [
      'warn'
    ],
    'no-debugger': [
      'warn'
    ],
    'no-dupe-args': [
      'warn'
    ],
    'no-dupe-else-if': [
      'warn'
    ],
    'no-dupe-keys': [
      'warn'
    ],
    'no-duplicate-case': [
      'warn'
    ],
    'no-empty': [
      'warn'
    ],
    'no-empty-character-class': [
      'warn'
    ],
    'no-ex-assign': [
      'warn'
    ],
    'no-extra-boolean-cast': [
      'warn'
    ],
    'no-extra-parens': [
      'off'
    ],
    'no-extra-semi': [
      'warn'
    ],
    'no-func-assign': [
      'warn'
    ],
    'no-import-assign': [
      'warn'
    ],
    'no-inner-declarations': [
      'warn'
    ],
    'no-invalid-regexp': [
      'warn'
    ],
    'no-irregular-whitespace': [
      'warn'
    ],
    'no-loss-of-precision': [
      'off'
    ],
    'no-misleading-character-class': [
      'warn'
    ],
    'no-obj-calls': [
      'warn'
    ],
    'no-promise-executor-return': [
      'off'
    ],
    'no-prototype-builtins': [
      'warn'
    ],
    'no-regex-spaces': [
      'warn'
    ],
    'no-setter-return': [
      'warn'
    ],
    'no-sparse-arrays': [
      'warn'
    ],
    'no-template-curly-in-string': [
      'warn'
    ],
    'no-unexpected-multiline': [
      'warn'
    ],
    'no-unreachable': [
      'warn'
    ],
    'no-unreachable-loop': [
      'off'
    ],
    'no-unsafe-finally': [
      'warn'
    ],
    'no-unsafe-negation': [
      'warn'
    ],
    'no-unsafe-optional-chaining': [
      'off'
    ],
    'no-useless-backreference': [
      'off'
    ],
    'require-atomic-updates': [
      'off'
    ],
    'use-isnan': [
      'warn'
    ],
    'valid-typeof': [
      'warn'
    ],
    'accessor-pairs': [
      'off'
    ],
    'array-callback-return': [
      'off'
    ],
    'block-scoped-var': [
      'off'
    ],
    'class-methods-use-this': [
      'off'
    ],
    complexity: [
      'off'
    ],
    'consistent-return': [
      'off'
    ],
    curly: [
      'warn',
      'multi-or-nest',
      'consistent'
    ],
    'default-case': [
      'warn'
    ],
    'default-case-last': [
      'warn'
    ],
    'default-param-last': [
      'warn'
    ],
    'dot-location': [
      'off'
    ],
    'dot-notation': [
      'warn'
    ],
    eqeqeq: [
      'warn',
      'always'
    ],
    'grouped-accessor-pairs': [
      'off'
    ],
    'guard-for-in': [
      'off'
    ],
    'max-classes-per-file': [
      'off'
    ],
    'no-alert': [
      'off'
    ],
    'no-caller': [
      'warn'
    ],
    'no-case-declarations': [
      'warn'
    ],
    'no-constructor-return': [
      'warn'
    ],
    'no-div-regex': [
      'off'
    ],
    'no-else-return': [
      'off'
    ],
    'no-empty-function': [
      'off'
    ],
    'no-empty-pattern': [
      'warn'
    ],
    'no-eq-null': [
      'off'
    ],
    'no-eval': [
      'warn'
    ],
    'no-extend-native': [
      'off'
    ],
    'no-extra-bind': [
      'warn'
    ],
    'no-extra-label': [
      'off'
    ],
    'no-fallthrough': [
      'warn'
    ],
    'no-floating-decimal': [
      'off'
    ],
    'no-global-assign': [
      'warn'
    ],
    'no-implicit-coercion': [
      'warn',
      {
        allow: [
          '!!'
        ]
      }
    ],
    'no-implicit-globals': [
      'off'
    ],
    'no-implied-eval': [
      'warn'
    ],
    'no-invalid-this': [
      'off'
    ],
    'no-iterator': [
      'warn'
    ],
    'no-labels': [
      'warn'
    ],
    'no-lone-blocks': [
      'warn'
    ],
    'no-loop-func': [
      'warn'
    ],
    'no-magic-numbers': [
      'off'
    ],
    'no-multi-spaces': [
      'warn',
      {
        ignoreEOLComments: true
      }
    ],
    'no-multi-str': [
      'warn'
    ],
    'no-new': [
      'warn'
    ],
    'no-new-func': [
      'warn'
    ],
    'no-new-wrappers': [
      'warn'
    ],
    'no-nonoctal-decimal-escape': [
      'warn'
    ],
    'no-octal': [
      'warn'
    ],
    'no-octal-escape': [
      'warn'
    ],
    'no-param-reassign': [
      'warn'
    ],
    'no-proto': [
      'warn'
    ],
    'no-redeclare': [
      'warn'
    ],
    'no-restricted-properties': [
      'off'
    ],
    'no-return-assign': [
      'off'
    ],
    'no-return-await': [
      'off'
    ],
    'no-script-url': [
      'warn'
    ],
    'no-self-assign': [
      'warn'
    ],
    'no-self-compare': [
      'warn'
    ],
    'no-sequences': [
      'warn'
    ],
    'no-throw-literal': [
      'warn'
    ],
    'no-unmodified-loop-condition': [
      'off'
    ],
    'no-unused-expressions': [
      'off'
    ],
    'no-unused-labels': [
      'warn'
    ],
    'no-useless-call': [
      'warn'
    ],
    'no-useless-catch': [
      'warn'
    ],
    'no-useless-concat': [
      'warn'
    ],
    'no-useless-escape': [
      'warn'
    ],
    'no-useless-return': [
      'warn'
    ],
    'no-void': [
      'warn'
    ],
    'no-warning-comments': [
      'off'
    ],
    'no-with': [
      'warn'
    ],
    'prefer-named-capture-group': [
      'off'
    ],
    'prefer-promise-reject-errors': [
      'off'
    ],
    'prefer-regex-literals': [
      'warn'
    ],
    radix: [
      'off'
    ],
    'require-await': [
      'warn'
    ],
    'require-unicode-regexp': [
      'off'
    ],
    'vars-on-top': [
      'warn'
    ],
    'wrap-iife': [
      'warn'
    ],
    yoda: [
      'warn'
    ],
    strict: [
      'warn'
    ],
    'init-declarations': [
      'off',
      'always'
    ],
    'no-delete-var': [
      'warn'
    ],
    'no-label-var': [
      'off'
    ],
    'no-restricted-globals': [
      'off'
    ],
    'no-shadow': [
      'off'
    ],
    'no-shadow-restricted-names': [
      'warn'
    ],
    'no-undef': [
      'warn'
    ],
    'no-undef-init': [
      'warn'
    ],
    'no-undefined': [
      'off'
    ],
    'no-use-before-define': [
      'off'
    ],
    'array-bracket-newline': [
      'warn',
      'consistent'
    ],
    'array-bracket-spacing': [
      'warn',
      'never'
    ],
    'array-element-newline': [
      'warn',
      'consistent'
    ],
    'block-spacing': [
      'warn',
      'always'
    ],
    'brace-style': [
      'warn',
      '1tbs'
    ],
    camelcase: [
      'off'
    ],
    'capitalized-comments': [
      'off'
    ],
    'comma-dangle': [
      'warn',
      'never'
    ],
    'comma-spacing': [
      'warn',
      {
        before: false,
        after: true
      }
    ],
    'comma-style': [
      'warn',
      'last'
    ],
    'computed-property-spacing': [
      'off'
    ],
    'consistent-this': [
      'off'
    ],
    'eol-last': [
      'warn',
      'never'
    ],
    'func-call-spacing': [
      'warn',
      'never'
    ],
    'func-name-matching': [
      'warn',
      'never'
    ],
    'func-names': [
      'off'
    ],
    'func-style': [
      'warn',
      'declaration',
      {
        allowArrowFunctions: true
      }
    ],
    'function-call-argument-newline': [
      'warn',
      'consistent'
    ],
    'function-paren-newline': [
      'off',
      'never'
    ],
    'id-denylist': [
      'off'
    ],
    'id-length': [
      'off'
    ],
    'id-match': [
      'off'
    ],
    'implicit-arrow-linebreak': [
      'off',
      'beside'
    ],
    'jsx-quotes': [
      'warn',
      'prefer-single'
    ],
    'key-spacing': [
      'warn'
    ],
    'keyword-spacing': [
      'warn'
    ],
    'line-comment-position': [
      'off'
    ],
    'linebreak-style': [
      'off'
    ],
    'lines-around-comment': [
      'off'
    ],
    'lines-between-class-members': [
      'off',
      'always'
    ],
    'max-depth': [
      'warn',
      4
    ],
    'max-len': [
      'warn',
      {
        ignorePattern: '^import .*',
        ignoreUrls: true,
        // code: 180
        code: 500
      }
    ],
    'max-lines': [
      'off'
    ],
    'max-lines-per-function': [
      'off'
    ],
    'max-nested-callbacks': [
      'off'
    ],
    'max-params': [
      'warn',
      7
    ],
    'max-statements': [
      'off'
    ],
    'max-statements-per-line': [
      'off'
    ],
    'multiline-comment-style': [
      'off',
      'starred-block'
    ],
    'multiline-ternary': [
      'off'
    ],
    'new-cap': [
      'off'
    ],
    'new-parens': [
      'warn'
    ],
    'newline-per-chained-call': [
      'off'
    ],
    'no-array-constructor': [
      'warn'
    ],
    'no-bitwise': [
      'warn'
    ],
    'no-continue': [
      'warn'
    ],
    'no-inline-comments': [
      'off'
    ],
    'no-lonely-if': [
      'warn'
    ],
    'no-mixed-operators': [
      'warn'
    ],
    'no-mixed-spaces-and-tabs': [
      'warn'
    ],
    'no-multi-assign': [
      'warn'
    ],
    'no-multiple-empty-lines': [
      'warn'
    ],
    'no-negated-condition': [
      'warn'
    ],
    'no-nested-ternary': [
      'off'
    ],
    'no-new-object': [
      'warn'
    ],
    'no-plusplus': [
      'warn',
      {
        allowForLoopAfterthoughts: true
      }
    ],
    'no-restricted-syntax': [
      'off'
    ],
    'no-tabs': [
      'off'
    ],
    'no-ternary': [
      'off'
    ],
    'no-trailing-spaces': [
      'warn'
    ],
    'no-underscore-dangle': [
      'off'
    ],
    'no-unneeded-ternary': [
      'warn'
    ],
    'no-whitespace-before-property': [
      'warn'
    ],
    'nonblock-statement-body-position': [
      'warn',
      'any'
    ],
    'object-curly-newline': [
      'warn',
      {
        consistent: true
      }
    ],
    'object-curly-spacing': [
      'warn',
      'always'
    ],
    'object-property-newline': [
      'off'
    ],
    'one-var': [
      'warn',
      'never'
    ],
    'one-var-declaration-per-line': [
      'off'
    ],
    'operator-assignment': [
      'warn',
      'always'
    ],
    'operator-linebreak': [
      'warn',
      'before',
      {
        overrides: {
          '||': 'after',
          '+': 'after'
        }
      }
    ],
    'padded-blocks': [
      'warn',
      'never'
    ],
    'padding-line-between-statements': [
      'off'
    ],
    'prefer-exponentiation-operator': [
      'warn'
    ],
    'prefer-object-spread': [
      'warn'
    ],
    'quote-props': [
      'warn',
      'as-needed'
    ],
    semi: [
      'warn',
      'never'
    ],
    'semi-spacing': [
      'warn',
      {
        before: false,
        after: true
      }
    ],
    'semi-style': [
      'warn',
      'last'
    ],
    'space-before-blocks': [
      'warn',
      'always'
    ],
    'space-before-function-paren': [
      'warn',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    'space-in-parens': [
      'warn',
      'never'
    ],
    'space-infix-ops': [
      'warn'
    ],
    'space-unary-ops': [
      'warn',
      {
        words: true,
        nonwords: false
      }
    ],
    'spaced-comment': [
      'warn',
      'always',
      {
        markers: ['/']
      }
    ],
    'switch-colon-spacing': [
      'warn',
      {
        after: true,
        before: false
      }
    ],
    'template-tag-spacing': [
      'warn',
      'always'
    ],
    'unicode-bom': [
      'off'
    ],
    'wrap-regex': [
      'warn'
    ],
    'arrow-body-style': [
      'warn',
      'as-needed'
    ],
    'arrow-parens': [
      'warn'
    ],
    'arrow-spacing': [
      'warn'
    ],
    'constructor-super': [
      'warn'
    ],
    'generator-star-spacing': [
      'off'
    ],
    'no-class-assign': [
      'warn'
    ],
    'no-confusing-arrow': [
      'warn'
    ],
    'no-const-assign': [
      'warn'
    ],
    'no-dupe-class-members': [
      'warn'
    ],
    'no-duplicate-imports': [
      'warn',
      {
        includeExports: true
      }
    ],
    'no-new-symbol': [
      'warn'
    ],
    'no-restricted-exports': [
      'off'
    ],
    'no-restricted-imports': [
      'off'
    ],
    'no-this-before-super': [
      'warn'
    ],
    'no-useless-computed-key': [
      'off'
    ],
    'no-useless-constructor': [
      'off'
    ],
    'no-useless-rename': [
      'off'
    ],
    'no-var': [
      'warn'
    ],
    'object-shorthand': [
      'off'
    ],
    'prefer-arrow-callback': [
      'warn'
    ],
    'prefer-const': [
      'warn'
    ],
    'prefer-destructuring': [
      'off'
    ],
    'prefer-numeric-literals': [
      'warn'
    ],
    'prefer-rest-params': [
      'warn'
    ],
    'prefer-spread': [
      'warn'
    ],
    'prefer-template': [
      'off'
    ],
    'require-yield': [
      'warn'
    ],
    'rest-spread-spacing': [
      'warn',
      'never'
    ],
    'sort-imports': [
      'off'
    ],
    'symbol-description': [
      'off'
    ],
    'template-curly-spacing': [
      'warn',
      'never'
    ],
    'yield-star-spacing': [
      'off'
    ]
  },
  overrides: [
    {
      files: [
        'src/**/*.js?(x)',
        'src/**/*.ts?(x)'
      ],
      rules: {
        'import/no-anonymous-default-export': 'off'
      }
    },
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['off']
      }
    }
  ]
}