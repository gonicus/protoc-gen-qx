const protocPlugin = require('protoc-plugin')
const findCommentByPath = protocPlugin.findCommentByPath
const {getClassComment, getClassNamespace, normalizeComments} = require('./base')
const config = require('../config')
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const baseNamespace = config.get('baseNamespace')
const lineEnd = config.get('withoutSemi') ? '' : ';'

const template = handlebars.compile(fs.readFileSync(path.join(__dirname, '..', 'templates', 'ServiceClass.js.hbs'), 'utf8'))


const genServiceClass = (service, s, proto) => {
  const members = []

  service.methodList.forEach((rpc, r) => {
    const paramComments = [`     * @param {${baseNamespace}${rpc.inputType}} payload`]
    let callbackParams = ''
    if (rpc.serverStreaming === true) {
      callbackParams = ', callback, quiet. context'
      paramComments.push(`     * @param {Function} callback onMessage callback`)
      paramComments.push('     * @param {boolean} [quiet] quiet do not notify the before or after call listeners')
      paramComments.push(`     * @param {Object} [context] onMessage callback context`)
    } else {
      callbackParams = ', quiet, context'
      paramComments.push('     * @param {boolean} [quiet] do not notify the before or after call listeners')
      paramComments.push(`     * @param {Object} [context] promise context`)
    }
    members.push(`/**
${normalizeComments(findCommentByPath([6, s, 2, r], proto.sourceCodeInfo.locationList), 5)}
${paramComments.join('\n')}
     * @returns {Promise} resolves to {${baseNamespace}${rpc.outputType}}${rpc.options && rpc.options.deprecated ? '     * @deprecated' : ''}
     */
    ${rpc.name}: function (payload${callbackParams}) {
      qx.core.Assert.assertInstance(payload, ${baseNamespace}${rpc.inputType})
      return this._call(payload, {
        methodName: '${rpc.name}',
        service: this,
        requestStream: ${rpc.clientStreaming},
        responseStream: ${rpc.serverStreaming},
        requestType: ${baseNamespace}${rpc.inputType},
        responseType: ${baseNamespace}${rpc.outputType},
        quiet: quiet
      }${callbackParams})
    }`)
  })

  const classNamespace = getClassNamespace(service, proto)

  // class basics
  let initCode = [`extend: ${config.getExtend('service', classNamespace)}`]
  const includes = config.getIncludes('service', classNamespace)
  if (includes.length) {
    initCode.push(`include: [${includes.join(', ')}]`)
  }
  const interfaces = config.getImplements('service', classNamespace)
  if (interfaces.length) {
    initCode.push(`implement: [${interfaces.join(', ')}]}`)
  }

  let code = template({
    classComment: getClassComment(service, s, proto, 6),
    classNamespace: classNamespace,
    serviceName: `${proto.pb_package}.${service.name}`,
    initCode: initCode,
    members: members,
    lineEnd: lineEnd
  })
  return [{
    namespace: classNamespace,
    code: code
  }]
}

module.exports = genServiceClass
