const defaultConfig = require('@commitlint/config-conventional');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    ...defaultConfig.rules,
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'format',
      ],
    ],
  },
};
