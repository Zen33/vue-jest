const findBabelConfig = require('find-babel-config')
const logger = require('./logger')
const cache = require('./cache')
const { readFileSync } = require('fs')

module.exports = function getBabelConfig (vueJestConfig) {
  const cachedConfig = cache.get('babel-config')
  if (cachedConfig) {
    return cachedConfig
  } else if (cachedConfig === false) {
    return
  } else {
    let babelConfig

    if (vueJestConfig.babelRcFile) {
      babelConfig = JSON.parse(readFileSync(vueJestConfig.babelRcFile))
    } else {
      const { file, config } = findBabelConfig.sync(process.cwd(), 0)

      if (!file) {
        logger.info('no .babelrc found, skipping babel compilation')
        cache.set('babel-config', false)
        return
      }

      babelConfig = config
    }

    cache.set('babel-config', babelConfig)
    return babelConfig
  }
}
