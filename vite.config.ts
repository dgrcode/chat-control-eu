import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import { parseChatControlData } from './src/data/parse.ts'

const mepDataPath = fileURLToPath(
  new URL('./data/all-meps--2021-to-2026-vote-history-and-contacts.md', import.meta.url),
)
const voteLedgerPath = fileURLToPath(
  new URL('./sources/vote-ledger.md', import.meta.url),
)

function loadDataset() {
  return parseChatControlData(
    readFileSync(mepDataPath, 'utf8'),
    readFileSync(voteLedgerPath, 'utf8'),
  )
}

function chatControlDataPlugin(): Plugin {
  const publicId = 'virtual:chat-control-data'
  const resolvedId = `\0${publicId}`

  return {
    name: 'chat-control-data',
    resolveId(id) {
      return id === publicId ? resolvedId : undefined
    },
    load(id) {
      if (id !== resolvedId) return undefined
      this.addWatchFile(mepDataPath)
      this.addWatchFile(voteLedgerPath)
      return `export default ${JSON.stringify(loadDataset())}`
    },
  }
}

const dataset = loadDataset()

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    chatControlDataPlugin(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        concurrency: 2,
        retryCount: 2,
        retryDelay: 250,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
      pages: dataset.meps.map((mep) => ({ path: `/meps/${mep.slug}` })),
    }),
    viteReact(),
  ],
})
