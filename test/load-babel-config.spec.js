import loadBabelConfig from '../lib/load-babel-config'
import { resolve } from 'path'
import {
  createReadStream,
  createWriteStream,
  readFileSync,
  renameSync,
  writeFileSync,
  unlinkSync
} from 'fs'
import clearModule from 'clear-module'
import cache from '../lib/cache'

describe('load-babel-config.js', () => {
  beforeEach(() => {
    cache.flushAll()
    clearModule.all()
  })

  it('returns undefined if there is no .babelrc', () => {
    const babelRcPath = resolve(__dirname, '../.babelrc')
    const tempPath = resolve(__dirname, '../.renamed')
    renameSync(babelRcPath, tempPath)
    const babelConfig = loadBabelConfig({})
    try {
      expect(babelConfig).toBe(undefined)
    } catch (err) {
      renameSync(tempPath, babelRcPath)
      throw err
    }
    renameSync(tempPath, babelRcPath)
    const babelConfigCached = loadBabelConfig()
    expect(babelConfigCached).toBe(undefined)
  })

  it('reads babelrc from jest globals if exists', () => {
    const jestGlobalBabelPath = resolve(__dirname, '../jest.babelrc')
    writeFileSync(jestGlobalBabelPath, JSON.stringify({
      plugins: ['foo']
    }))
    const jestGlobalBabelConfig = JSON.parse(readFileSync(jestGlobalBabelPath, { encoding: 'utf8' }))
    const babelConfig = loadBabelConfig({
      babelRcFile: 'jest.babelrc'
    })
    expect(babelConfig).toEqual(jestGlobalBabelConfig)
    unlinkSync(jestGlobalBabelPath)
  })

  it('reads default babel if there is .babelrc', () => {
    const babelRcPath = resolve(__dirname, '../.babelrc')
    const babelRcCopiedPath = resolve(__dirname, '../.babelrc_cp')
    createReadStream(babelRcPath).pipe(createWriteStream(babelRcCopiedPath))
    const babelRcOriginal = JSON.parse(readFileSync(babelRcPath, { encoding: 'utf8' }))
    const babelConfig = loadBabelConfig({})
    expect(babelConfig).toEqual(babelRcOriginal)
    const tempPath = resolve(__dirname, '../.renamed')
    renameSync(babelRcCopiedPath, tempPath)
    const babelConfigCached = loadBabelConfig()
    try {
      expect(babelConfig).not.toBe(babelConfigCached)
      expect(babelConfig).toEqual(babelConfigCached)
    } catch (err) {
      renameSync(tempPath, babelRcCopiedPath)
      throw err
    }
  })
})
