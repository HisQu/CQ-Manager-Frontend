import {defineConfig, mergeConfig} from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['tests/setup.ts'],
    mockReset: true,
    // Never talk to a real backend, whatever VITE_API_URL the shell exports.
    env: { VITE_API_URL: 'http://api.test.invalid' },
  },
}))
