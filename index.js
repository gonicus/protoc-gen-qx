#! /usr/bin/env node

/* eslint-env es6, node */
const webpack = require('webpack')
const MemoryFileSystem = require('memory-fs')
const memoryFs = new MemoryFileSystem();
const fs = require('fs')
const path = require('path')
const config = require('./config')
const {CodeGeneratorRequest, CodeGeneratorResponse, CodeGeneratorResponseError} = require('protoc-plugin')
const baseNamespace = config.get('baseNamespace')
const handlebars = require('handlebars')
const merge = require('lodash.merge')
const handlers = {
  serviceList: require('./handlers/service'),
  enumTypeList: require('./handlers/enum'),
  messageTypeList: require('./handlers/message')
}
const lineEnd = config.get('withoutSemi') ? '' : ';'

const webpackConfig = require('./webpack.config')
const externalResources = []
webpackConfig.forEach(config => {
  externalResources.push(`"${baseNamespace}/${config.output.filename}"`)
})
let template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'core', 'BaseService.js.hbs'), 'utf8'))
const debugApiCalls = config.get('debugApiCalls')
let baseServiceClass = template({
  baseNamespace: baseNamespace,
  lineEnd: lineEnd,
  debugUnary: debugApiCalls === true || debugApiCalls === 'single',
  debugInvoke: debugApiCalls === true || debugApiCalls === 'stream'
})

// extensions must be required before parsing
config.get('require').forEach(dep => {
  const depPath = path.normalize(path.join(process.cwd() + '/' + dep))
  require(depPath)
})

let sourceDir = config.get('sourceDir')
if (sourceDir && !sourceDir.endsWith('/')) {
  sourceDir += '/'
}

// register option handlers
const optionHandler = require('./handlers/options/index')
let {name, handler} = require('./handlers/options/qx')
optionHandler.registerHandler(name, handler)
config.get('optionHandlers').forEach(handlerPath => {
  let {name, handler} = require(path.normalize(path.join(process.cwd() + '/' + handlerPath)))
  optionHandler.registerHandler(name, handler)
})

CodeGeneratorRequest()
  .then(async r => {
    const req = r.toObject()

    // parse parameters
    let paramParts, key, value
    const parameters = {}
    if (req.parameter) {
      req.parameter.split(',').forEach(param => {
        paramParts = param.split('=')
        key = paramParts.shift()
        value = paramParts.length > 0 ? paramParts.join('=') : true
        parameters[key] = value
      })
    }
    
    const protos = req.protoFileList.filter(p => req.fileToGenerateList.indexOf(p.name) !== -1)
    const skipDeps = config.get('skipDeps')
    let external = [
      "proto/google-protobuf.js",
      "proto/grpc-web-client.js"
    ].filter(entry => !skipDeps.includes(entry.split('/').pop()))

    const files = []

    if (!config.get('skipCoreFiles')) {
      files.push({
        name: `${sourceDir}/class/${baseNamespace}/core/BaseService.js`,
        content: baseServiceClass
      })
    }

    if (config.get('embed') !== true) {
      const manifest = merge({
        info: {
          version: "latest"
        },
        provides: {
          namespace: baseNamespace,
          encoding: "utf-8",
          class: sourceDir + "class",
          resource: sourceDir + "resource",
          type: "library"
        }
      }, config.get('manifest'))
      if (external.length > 0) {
        if (!manifest.externalResources) {
          manifest.externalResources = {}
        }
        if (!manifest.externalResources.script) {
          manifest.externalResources.script = []
        }
        manifest.externalResources.script = manifest.externalResources.script.concat(external)
      }
      files.push({
        name: 'Manifest.json',
        content: JSON.stringify(manifest, null, 2)
      })
    }
    const whitelist = config.get('whitelist')

    protos.forEach(proto => {
      if (parameters.dump === true) {
        files.push({
          name: `${proto.pb_package}-${proto.name}-extended.json`,
          content: JSON.stringify(proto, null, 2)
        })
      }
      Object.keys(handlers).forEach( propName => {
        if (proto[propName]) {
          let items = proto[propName]
          if (whitelist.hasOwnProperty(proto.name)) {
            items = items.filter(item => {
              return whitelist[proto.name].indexOf(item.name) >= 0
            })
          }
        
          items.forEach((item, s) => {
            handlers[propName](item, s, proto).forEach(entry => {
              files.push({
                name: `${sourceDir}/class/${entry.namespace.split('.').join('/')}.js`,
                content: entry.code
              })
            })
          })
        }
      })
    })

    if (!config.get('skipCoreFiles')) {

      template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'core', 'BaseMessage.js.hbs'), 'utf8'))
      let baseMessageClass = template({
        baseNamespace: baseNamespace,
        lineEnd: lineEnd,
        timestampSupport: !!config.get('timestampSupport'),
        useUTC: config.get('useUTC') === true,
        defer: config.get('skipDepLoadingFallback') === true
          ? ''
          : `,

    defer: function (statics) {
      if (!window.grpc) {
        // load dependencies
        var dynLoader = new qx.util.DynamicScriptLoader([
          qx.util.ResourceManager.getInstance().toUri(${externalResources.join('),\n      qx.util.ResourceManager.getInstance().toUri(')})
        ]);
    
        qx.bom.Lifecycle.onReady(function () {
          dynLoader.start().catch(function (err) {
            qx.log.Logger.error(statics, 'failed to load scripts', err);
          });
        }, this);
      }
    }`
      })

      files.push({
        name: `${sourceDir}/class/${baseNamespace}/core/BaseMessage.js`,
        content: baseMessageClass
      })

      template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'core', 'Error.js.hbs'), 'utf8'))
      let errorClass = template({
        lineEnd: lineEnd
      })

      files.push({
        name: `${sourceDir}/class/${baseNamespace}/core/Error.js.hbs`,
        content: errorClass
      })

      if (config.get('validatorClasses').length) {
        template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'core', 'ValidatorFactory.js.hbs'), 'utf8'))
        let validatorFactoryClass = template({
          baseNamespace: baseNamespace,
          validatorClasses: config.get('validatorClasses').filter(clazz => clazz !== 'qx.util.Validate'),
          lineEnd: lineEnd,
        })
        files.push({
          name: `${sourceDir}/class/${baseNamespace}/util/ValidatorFactory.js`,
          content: validatorFactoryClass
        })
      }
    }

    if (parameters.skipDeps !== true) {
      // create resources
      let compiler
      const promises = []
      webpackConfig.forEach(async config => {
        if (skipDeps.includes(config.output.filename)) {
          return;
        }
        config.output.path = '/build'
        compiler = webpack(config)
        compiler.outputFileSystem = memoryFs

        promises.push(new Promise((resolve, reject) => {
          compiler.run((err, stats) => {
            if (err) reject(err)
            if (stats.compilation.assets[config.output.filename]) {
              files.push({
                name: `${sourceDir}/resource/${baseNamespace}/${config.output.filename}`,
                content: stats.compilation.assets[config.output.filename].source()
              })
            } else if (stats.compilation.errors.length > 0) {
              reject(new Error(stats.compilation.errors[0]));
            } else {
              reject(new Error('file ' + config.output.filename + ' not found'));
            }
            resolve()
          })
        }))
      })
      await Promise.all(promises)
    }
    return files
  }).then(CodeGeneratorResponse())
    .catch(CodeGeneratorResponseError())
