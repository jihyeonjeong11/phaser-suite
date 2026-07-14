import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/build', '**/out', 'frontend/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended]
  },
  eslintConfigPrettier
)
