// Lint the files included in each typescript project with common rules
const projects = ['./../../.tsconfig/tsconfig.json'];

// Lint the files included in each typescript project with common rules and jest specific rules
const projectsTests = ['./../../.tsconfig/tsconfig.test.json'];

const plugins = ['@typescript-eslint'];

// Lint project using its tsconfig.json.
const lintProjects = () => {
  return [
    {
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        //'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier'
      ],
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: projects,
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      plugins,
      rules: {
        ...require('./eslint.rules.cjs'),
        ...require('./typescript-eslint.rules.cjs')
      }
    }
  ];
};

// Attention: Declaration order has importance as rules apply in cascade.
const lintProjectsWithoutTests = () => {
  return [...lintProjects()];
};

// tests must be included in their tsconfig project.
const lintTests = () => {
  return [
    {
      env: {
        'jest/globals': true
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: projectsTests,
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      files: ['**/*.test.ts', '**/*.spec.ts'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      plugins: ['jest', '@typescript-eslint'],
      rules: {
        ...require('./eslint.rules.cjs'),
        ...require('./eslint-test.rules.cjs'),
        ...require('./typescript-eslint.rules.cjs'),
        ...require('./typescript-eslint-test.rules.cjs'),
        ...require('./jest-eslint.rules.cjs')
      }
    }
  ];
};

module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  overrides: [...lintProjectsWithoutTests(), ...lintTests()]
};
