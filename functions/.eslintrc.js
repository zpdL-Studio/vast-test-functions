module.exports = {
  extends: [
    'eslint-config-google',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'max-len': ['error', {
      code: 80,
      ignoreUrls: true,
      ignoreStrings: true,
      ignorePattern: '^\\s*<.*>$', // XML 태그 라인 무시
      ignoreComments: true, // 모든 주석 무시
    }],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn'],
    'camelcase': ['error'],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'require-jsdoc': ['warn', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: false,
        FunctionExpression: false,
      },
    }],
  },
};
