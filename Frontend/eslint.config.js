import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: { ...globals.browser },
    },
    plugins: { react, 'react-refresh': reactRefresh },
    rules: {
      'react/react-in-jsx-scope': 'off', // ✅ fix lỗi React must be in scope
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    settings: { react: { version: 'detect' } },
  },
  prettier,
]
