import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import UnocssIcons from '@unocss/preset-icons'
import { presetAttributify, presetUno } from 'unocss'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),

    Unocss({
      presets: [
        presetAttributify({
          /* preset options */
        }),
        presetUno(),
        UnocssIcons({
          prefix: 'i-',
          extraProperties: {
            display: 'inline-block'
          }
        })
      ]
    }),

    Components(),

    AutoImport({
      imports: ['vue']
    })
  ]
})
