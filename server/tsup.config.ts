import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  // include our own shared package in the build output
  noExternal: ['@repairhub/shared'],
})
