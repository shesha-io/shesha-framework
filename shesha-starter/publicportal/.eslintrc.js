module.exports = {
    env: {
      browser: true,
    },
    ignorePatterns: [
      '/.next/**',
      '/dist/**',
      '/.out/**',
      '/node_modules/**',
      '/example/**',
      '/src/api/*',
      '**/__tests__/**',
      '/.storybook/**',
      '.eslintrc.js',
      'next.config.js',
      '/test/*',
      '/public/static/**',
      'server.js',
      '/packages/*',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      sourceType: 'module',
      tsconfigRootDir: __dirname,
    },
    plugins: ['eslint-plugin-jsdoc', '@typescript-eslint', '@typescript-eslint/tslint'],
    root: true,
    rules: {
      'sort-imports': [
        'off',
        {
          /* todo: enable and auto-fix */ ignoreCase: false,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
      '@typescript-eslint/dot-notation': 'off',
      /*error*/
      '@typescript-eslint/explicit-function-return-type': [
        'off' /*error*/,
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [
        'off' /*error*/,
        {
          allowArgumentsExplicitlyTypedAsAny: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: false,
        },
      ],
      '@typescript-eslint/indent': 'off',
      /*error*/
      '@typescript-eslint/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase' /*to be removed*/],
  
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      /*error*/
      '@typescript-eslint/quotes': ['off' /*error*/, 'double'],
      '@typescript-eslint/semi': ['error', 'always'],
      '@typescript-eslint/type-annotation-spacing': 'error',
      '@typescript-eslint/typedef': [
        'off' /*error*/,
        {
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
        },
      ],
      'brace-style': ['error', '1tbs'],
      'capitalized-comments': ['off' /*error*/, 'never'],
      curly: 'off',
      /*error*/
      'dot-notation': 'off',
      'eol-last': 'off',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',
      'id-denylist': 'off',
      'id-match': 'off',
      indent: 'off',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'off',
      /*error*/
      'max-len': [
        'error',
        {
          code: 300 /*140*/,
        },
      ],
  
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': [
        'error',
        {
          allow: [
            'log',
            'warn',
            'dir',
            'timeLog',
            'assert',
            'clear',
            'count',
            'countReset',
            'group',
            'groupEnd',
            'table',
            'dirxml',
            'error',
            'groupCollapsed',
            'Console',
            'profile',
            'profileEnd',
            'timeStamp',
            'context',
          ],
        },
      ],
      'no-debugger': 'error',
      'no-empty': 'error',
      'no-empty-function': 'off',
      'no-eval': 'error',
      'no-new-wrappers': 'error',
      'no-redeclare': 'error',
      'no-trailing-spaces': 'off',
      /*error*/
      'no-underscore-dangle': 'off',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'error',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      quotes: 'off',
      radix: 'error',
      semi: 'off',
      'spaced-comment': [
        'off' /*error*/,
        'always',
        {
          markers: ['/'],
        },
      ],
      '@typescript-eslint/tslint/config': [
        'error',
        {
          rules: {
            ban: [true, ['_', 'extend'], ['_', 'isNull'], ['_', 'isDefined']] /*,
                                                                              "label-undefined": true,
                                                                              "no-duplicate-key": true,
                                                                              "no-trailing-comma": true,
                                                                              "no-unreachable": true,
                                                                              "use-strict": [
                                                                                 true,
                                                                                 "check-module",
                                                                                 "check-function"
                                                                              ]*/,
          },
        },
      ],
    },
  
    settings: {
      react: {
        createClass: 'createReactClass',
        pragma: 'React',
        fragment: 'Fragment',
        version: 'detect',
        flowVersion: '0.53',
      },
      propWrapperFunctions: [
        'forbidExtraProps',
        {
          property: 'freeze',
          object: 'Object',
        },
        {
          property: 'myFavoriteWrapper',
        },
        {
          property: 'forbidExtraProps',
          exact: true,
        },
      ],
      componentWrapperFunctions: [
        'observer',
        {
          property: 'styled',
        },
        {
          property: 'observer',
          object: 'Mobx',
        },
        {
          property: 'observer',
          object: '<pragma>',
        },
      ],
      formComponents: [
        'CustomForm',
        {
          name: 'Form',
          formAttribute: 'endpoint',
        },
      ],
      linkComponents: [
        'Hyperlink',
        {
          name: 'Link',
          linkAttribute: 'to',
        },
      ],
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.json'],
        },
      },
      'import/extensions': ['.js', '.mjs', '.jsx'],
      'import/core-modules': [],
      'import/ignore': ['node_modules', '\\.(coffee|scss|css|less|hbs|svg|json)$'],
    },
    extends: ['plugin:react-hooks/recommended', 'plugin:@next/next/recommended'],
  };  
