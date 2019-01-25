var grpc=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){var r;r=function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.i=function(e){return e},n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=17)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(4);t.Metadata=r.BrowserHeaders},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.debug=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];console.debug?console.debug.apply(null,e):console.log.apply(null,e)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=null;t.default=function(e){null===r?(r=[e],setTimeout(function(){!function e(){if(r){var t=r;r=null;for(var n=0;n<t.length;n++)try{t[n]()}catch(s){null===r&&(r=[],setTimeout(function(){e()},0));for(var o=t.length-1;o>n;o--)r.unshift(t[o]);throw s}}}()},0)):r.push(e)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(0),o=n(10),s=n(5),i=n(1),a=n(2),u=n(6),d=n(19);t.client=function(e,t){return new c(e,t)};var c=function(){function e(e,t){this.started=!1,this.sentFirstMessage=!1,this.completed=!1,this.closed=!1,this.finishedSending=!1,this.onHeadersCallbacks=[],this.onMessageCallbacks=[],this.onEndCallbacks=[],this.parser=new o.ChunkParser,this.methodDefinition=e,this.props=t,this.createTransport()}return e.prototype.createTransport=function(){var e=this.props.host+"/"+this.methodDefinition.service.serviceName+"/"+this.methodDefinition.methodName,t={methodDefinition:this.methodDefinition,debug:this.props.debug||!1,url:e,onHeaders:this.onTransportHeaders.bind(this),onChunk:this.onTransportChunk.bind(this),onEnd:this.onTransportEnd.bind(this)};this.props.transport?this.transport=this.props.transport(t):this.transport=u.makeDefaultTransport(t)},e.prototype.onTransportHeaders=function(e,t){if(this.props.debug&&i.debug("onHeaders",e,t),this.closed)this.props.debug&&i.debug("grpc.onHeaders received after request was closed - ignoring");else if(0===t);else{this.responseHeaders=e,this.props.debug&&i.debug("onHeaders.responseHeaders",JSON.stringify(this.responseHeaders,null,2));var n=p(e);this.props.debug&&i.debug("onHeaders.gRPCStatus",n);var r=n&&n>=0?n:s.httpStatusToCode(t);this.props.debug&&i.debug("onHeaders.code",r);var o=e.get("grpc-message")||[];if(this.props.debug&&i.debug("onHeaders.gRPCMessage",o),this.rawOnHeaders(e),r!==s.Code.OK){var a=this.decodeGRPCStatus(o[0]);this.rawOnError(r,a,e)}}},e.prototype.onTransportChunk=function(e){var t=this;if(this.closed)this.props.debug&&i.debug("grpc.onChunk received after request was closed - ignoring");else{var n=[];try{n=this.parser.parse(e)}catch(e){return this.props.debug&&i.debug("onChunk.parsing error",e,e.message),void this.rawOnError(s.Code.Internal,"parsing error: "+e.message)}n.forEach(function(e){if(e.chunkType===o.ChunkType.MESSAGE){var n=t.methodDefinition.responseType.deserializeBinary(e.data);t.rawOnMessage(n)}else e.chunkType===o.ChunkType.TRAILERS&&(t.responseHeaders?(t.responseTrailers=new r.Metadata(e.trailers),t.props.debug&&i.debug("onChunk.trailers",t.responseTrailers)):(t.responseHeaders=new r.Metadata(e.trailers),t.rawOnHeaders(t.responseHeaders)))})}},e.prototype.onTransportEnd=function(){if(this.props.debug&&i.debug("grpc.onEnd"),this.closed)this.props.debug&&i.debug("grpc.onEnd received after request was closed - ignoring");else if(void 0!==this.responseTrailers){var e=p(this.responseTrailers);if(null!==e){var t=this.responseTrailers.get("grpc-message"),n=this.decodeGRPCStatus(t[0]);this.rawOnEnd(e,n,this.responseTrailers)}else this.rawOnError(s.Code.Internal,"Response closed without grpc-status (Trailers provided)")}else{if(void 0===this.responseHeaders)return void this.rawOnError(s.Code.Unknown,"Response closed without headers");var r=p(this.responseHeaders),o=this.responseHeaders.get("grpc-message");if(this.props.debug&&i.debug("grpc.headers only response ",r,o),null===r)return void this.rawOnEnd(s.Code.Unknown,"Response closed without grpc-status (Headers only)",this.responseHeaders);var a=this.decodeGRPCStatus(o[0]);this.rawOnEnd(r,a,this.responseHeaders)}},e.prototype.decodeGRPCStatus=function(e){if(!e)return"";try{return decodeURIComponent(e)}catch(t){return e}},e.prototype.rawOnEnd=function(e,t,n){var r=this;this.props.debug&&i.debug("rawOnEnd",e,t,n),this.completed||(this.completed=!0,this.onEndCallbacks.forEach(function(o){a.default(function(){r.closed||o(e,t,n)})}))},e.prototype.rawOnHeaders=function(e){this.props.debug&&i.debug("rawOnHeaders",e),this.completed||this.onHeadersCallbacks.forEach(function(t){a.default(function(){t(e)})})},e.prototype.rawOnError=function(e,t,n){var o=this;void 0===n&&(n=new r.Metadata),this.props.debug&&i.debug("rawOnError",e,t),this.completed||(this.completed=!0,this.onEndCallbacks.forEach(function(r){a.default(function(){o.closed||r(e,t,n)})}))},e.prototype.rawOnMessage=function(e){var t=this;this.props.debug&&i.debug("rawOnMessage",e.toObject()),this.completed||this.closed||this.onMessageCallbacks.forEach(function(n){a.default(function(){t.closed||n(e)})})},e.prototype.onHeaders=function(e){this.onHeadersCallbacks.push(e)},e.prototype.onMessage=function(e){this.onMessageCallbacks.push(e)},e.prototype.onEnd=function(e){this.onEndCallbacks.push(e)},e.prototype.start=function(e){if(this.started)throw new Error("Client already started - cannot .start()");this.started=!0;var t=new r.Metadata(e||{});t.set("content-type","application/grpc-web+proto"),t.set("x-grpc-web","1"),this.transport.start(t)},e.prototype.send=function(e){if(!this.started)throw new Error("Client not started - .start() must be called before .send()");if(this.closed)throw new Error("Client already closed - cannot .send()");if(this.finishedSending)throw new Error("Client already finished sending - cannot .send()");if(!this.methodDefinition.requestStream&&this.sentFirstMessage)throw new Error("Message already sent for non-client-streaming method - cannot .send()");this.sentFirstMessage=!0;var t=d.frameRequest(e);this.transport.sendMessage(t)},e.prototype.finishSend=function(){if(!this.started)throw new Error("Client not started - .finishSend() must be called before .close()");if(this.closed)throw new Error("Client already closed - cannot .send()");if(this.finishedSending)throw new Error("Client already finished sending - cannot .finishSend()");this.finishedSending=!0,this.transport.finishSend()},e.prototype.close=function(){if(!this.started)throw new Error("Client not started - .start() must be called before .close()");if(this.closed)throw new Error("Client already closed - cannot .close()");this.closed=!0,this.props.debug&&i.debug("request.abort aborting request"),this.transport.cancel()},e}();function p(e){var t=e.get("grpc-status")||[];if(t.length>0)try{var n=t[0];return parseInt(n,10)}catch(e){return null}return null}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(14);t.BrowserHeaders=r.BrowserHeaders},function(e,t,n){"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),function(e){e[e.OK=0]="OK",e[e.Canceled=1]="Canceled",e[e.Unknown=2]="Unknown",e[e.InvalidArgument=3]="InvalidArgument",e[e.DeadlineExceeded=4]="DeadlineExceeded",e[e.NotFound=5]="NotFound",e[e.AlreadyExists=6]="AlreadyExists",e[e.PermissionDenied=7]="PermissionDenied",e[e.ResourceExhausted=8]="ResourceExhausted",e[e.FailedPrecondition=9]="FailedPrecondition",e[e.Aborted=10]="Aborted",e[e.OutOfRange=11]="OutOfRange",e[e.Unimplemented=12]="Unimplemented",e[e.Internal=13]="Internal",e[e.Unavailable=14]="Unavailable",e[e.DataLoss=15]="DataLoss",e[e.Unauthenticated=16]="Unauthenticated"}(r=t.Code||(t.Code={})),t.httpStatusToCode=function(e){switch(e){case 0:return r.Internal;case 200:return r.OK;case 400:return r.InvalidArgument;case 401:return r.Unauthenticated;case 403:return r.PermissionDenied;case 404:return r.NotFound;case 409:return r.Aborted;case 412:return r.FailedPrecondition;case 429:return r.ResourceExhausted;case 499:return r.Canceled;case 500:return r.Unknown;case 501:return r.Unimplemented;case 503:return r.Unavailable;case 504:return r.DeadlineExceeded;default:return r.Unknown}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(8),o=function(e){return r.CrossBrowserHttpTransport({withCredentials:!1})(e)};t.setDefaultTransportFactory=function(e){o=e},t.makeDefaultTransport=function(e){return o(e)}},function(e,t,n){"use strict";var r=this&&this.__assign||function(){return(r=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};Object.defineProperty(t,"__esModule",{value:!0});var o=n(0),s=n(1),i=n(2);t.FetchReadableStreamTransport=function(e){return function(t){return function(e,t){return e.debug&&s.debug("fetchRequest",e),new a(e,t)}(t,e)}};var a=function(){function e(e,t){this.cancelled=!1,this.controller=window.AbortController&&new AbortController,this.options=e,this.init=t}return e.prototype.pump=function(e,t){var n=this;if(this.reader=e,this.cancelled)return this.options.debug&&s.debug("Fetch.pump.cancel at first pump"),void this.reader.cancel();this.reader.read().then(function(e){if(e.done)return i.default(function(){n.options.onEnd()}),t;i.default(function(){n.options.onChunk(e.value)}),n.pump(n.reader,t)}).catch(function(e){n.cancelled?n.options.debug&&s.debug("Fetch.catch - request cancelled"):(n.cancelled=!0,n.options.debug&&s.debug("Fetch.catch",e.message),i.default(function(){n.options.onEnd(e)}))})},e.prototype.send=function(e){var t=this;fetch(this.options.url,r({},this.init,{headers:this.metadata.toHeaders(),method:"POST",body:e,signal:this.controller&&this.controller.signal})).then(function(e){if(t.options.debug&&s.debug("Fetch.response",e),i.default(function(){t.options.onHeaders(new o.Metadata(e.headers),e.status)}),!e.body)return e;t.pump(e.body.getReader(),e)}).catch(function(e){t.cancelled?t.options.debug&&s.debug("Fetch.catch - request cancelled"):(t.cancelled=!0,t.options.debug&&s.debug("Fetch.catch",e.message),i.default(function(){t.options.onEnd(e)}))})},e.prototype.sendMessage=function(e){this.send(e)},e.prototype.finishSend=function(){},e.prototype.start=function(e){this.metadata=e},e.prototype.cancel=function(){this.cancelled?this.options.debug&&s.debug("Fetch.abort.cancel already cancelled"):(this.cancelled=!0,this.reader?(this.options.debug&&s.debug("Fetch.abort.cancel"),this.reader.cancel()):this.options.debug&&s.debug("Fetch.abort.cancel before reader"),this.controller&&this.controller.abort())},e}();t.detectFetchSupport=function(){return"undefined"!=typeof Response&&Response.prototype.hasOwnProperty("body")&&"function"==typeof Headers}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(7),o=n(9);t.CrossBrowserHttpTransport=function(e){if(r.detectFetchSupport()){var t={credentials:e.withCredentials?"include":"same-origin"};return r.FetchReadableStreamTransport(t)}return o.XhrTransport({withCredentials:e.withCredentials})}},function(e,t,n){"use strict";var r,o=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});Object.defineProperty(t,"__esModule",{value:!0});var s=n(0),i=n(1),a=n(2),u=n(18);t.XhrTransport=function(e){return function(t){if(u.detectMozXHRSupport())return new c(t,e);if(u.detectXHROverrideMimeTypeSupport())return new d(t,e);throw new Error("This environment's XHR implementation cannot support binary transfer.")}};var d=function(){function e(e,t){this.options=e,this.init=t}return e.prototype.onProgressEvent=function(){var e=this;this.options.debug&&i.debug("XHR.onProgressEvent.length: ",this.xhr.response.length);var t=this.xhr.response.substr(this.index);this.index=this.xhr.response.length;var n=f(t);a.default(function(){e.options.onChunk(n)})},e.prototype.onLoadEvent=function(){var e=this;this.options.debug&&i.debug("XHR.onLoadEvent"),a.default(function(){e.options.onEnd()})},e.prototype.onStateChange=function(){var e=this;this.options.debug&&i.debug("XHR.onStateChange",this.xhr.readyState),this.xhr.readyState===XMLHttpRequest.HEADERS_RECEIVED&&a.default(function(){e.options.onHeaders(new s.Metadata(e.xhr.getAllResponseHeaders()),e.xhr.status)})},e.prototype.sendMessage=function(e){this.xhr.send(e)},e.prototype.finishSend=function(){},e.prototype.start=function(e){var t=this;this.metadata=e;var n=new XMLHttpRequest;this.xhr=n,n.open("POST",this.options.url),this.configureXhr(),this.metadata.forEach(function(e,t){n.setRequestHeader(e,t.join(", "))}),n.withCredentials=Boolean(this.init.withCredentials),n.addEventListener("readystatechange",this.onStateChange.bind(this)),n.addEventListener("progress",this.onProgressEvent.bind(this)),n.addEventListener("loadend",this.onLoadEvent.bind(this)),n.addEventListener("error",function(e){t.options.debug&&i.debug("XHR.error",e),a.default(function(){t.options.onEnd(e.error)})})},e.prototype.configureXhr=function(){this.xhr.responseType="text",this.xhr.overrideMimeType("text/plain; charset=x-user-defined")},e.prototype.cancel=function(){this.options.debug&&i.debug("XHR.abort"),this.xhr.abort()},e}();t.XHR=d;var c=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return o(t,e),t.prototype.configureXhr=function(){this.options.debug&&i.debug("MozXHR.configureXhr: setting responseType to 'moz-chunked-arraybuffer'"),this.xhr.responseType="moz-chunked-arraybuffer"},t.prototype.onProgressEvent=function(){var e=this,t=this.xhr.response;this.options.debug&&i.debug("MozXHR.onProgressEvent: ",new Uint8Array(t)),a.default(function(){e.options.onChunk(new Uint8Array(t))})},t}(d);function p(e,t){var n=e.charCodeAt(t);if(n>=55296&&n<=56319){var r=e.charCodeAt(t+1);r>=56320&&r<=57343&&(n=65536+(n-55296<<10)+(r-56320))}return n}function f(e){for(var t=new Uint8Array(e.length),n=0,r=0;r<e.length;r++){var o=String.prototype.codePointAt?e.codePointAt(r):p(e,r);t[n++]=255&o}return t}t.MozChunkedArrayBufferXHR=c,t.stringToArrayBuffer=f},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r,o=n(0),s=function(e){return 9===e||10===e||13===e};function i(e){return s(e)||e>=32&&e<=126}function a(e){for(var t=0;t!==e.length;++t)if(!i(e[t]))throw new Error("Metadata is not valid (printable) ASCII");return String.fromCharCode.apply(String,Array.prototype.slice.call(e))}function u(e){return 128==(128&e.getUint8(0))}function d(e){return e.getUint32(1,!1)}function c(e,t,n){return e.byteLength-t>=n}function p(e,t,n){if(e.slice)return e.slice(t,n);var r=e.length;void 0!==n&&(r=n);for(var o=new Uint8Array(r-t),s=0,i=t;i<r;i++)o[s++]=e[i];return o}t.decodeASCII=a,t.encodeASCII=function(e){for(var t=new Uint8Array(e.length),n=0;n!==e.length;++n){var r=e.charCodeAt(n);if(!i(r))throw new Error("Metadata contains invalid ASCII");t[n]=r}return t},function(e){e[e.MESSAGE=1]="MESSAGE",e[e.TRAILERS=2]="TRAILERS"}(r=t.ChunkType||(t.ChunkType={}));var f=function(){function e(){this.buffer=null,this.position=0}return e.prototype.parse=function(e,t){if(0===e.length&&t)return[];var n,s=[];if(null==this.buffer)this.buffer=e,this.position=0;else if(this.position===this.buffer.byteLength)this.buffer=e,this.position=0;else{var i=this.buffer.byteLength-this.position,f=new Uint8Array(i+e.byteLength),h=p(this.buffer,this.position);f.set(h,0);var l=new Uint8Array(e);f.set(l,i),this.buffer=f,this.position=0}for(;;){if(!c(this.buffer,this.position,5))return s;var g=p(this.buffer,this.position,this.position+5),b=new DataView(g.buffer,g.byteOffset,g.byteLength),y=d(b);if(!c(this.buffer,this.position,5+y))return s;var v=p(this.buffer,this.position+5,this.position+5+y);if(this.position+=5+y,u(b))return s.push({chunkType:r.TRAILERS,trailers:(n=v,new o.Metadata(a(n)))}),s;s.push({chunkType:r.MESSAGE,data:v})}},e}();t.ChunkParser=f},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(3);t.invoke=function(e,t){if(e.requestStream)throw new Error(".invoke cannot be used with client-streaming methods. Use .client instead.");var n=r.client(e,{host:t.host,transport:t.transport,debug:t.debug});return t.onHeaders&&n.onHeaders(t.onHeaders),t.onMessage&&n.onMessage(t.onMessage),t.onEnd&&n.onEnd(t.onEnd),n.start(t.metadata),n.send(t.request),n.finishSend(),{close:function(){n.close()}}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r,o=n(1),s=n(2),i=n(10);!function(e){e[e.FINISH_SEND=1]="FINISH_SEND"}(r||(r={}));var a=new Uint8Array([1]);t.WebsocketTransport=function(){return function(e){return function(e){e.debug&&o.debug("websocketRequest",e);var t,n=function(e){if("https://"===e.substr(0,8))return"wss://"+e.substr(8);if("http://"===e.substr(0,7))return"ws://"+e.substr(7);throw new Error("Websocket transport constructed with non-https:// or http:// host.")}(e.url),u=[];function d(e){if(e===r.FINISH_SEND)t.send(a);else{var n=e,o=new Int8Array(n.byteLength+1);o.set(new Uint8Array([0])),o.set(n,1),t.send(o)}}return{sendMessage:function(e){t&&t.readyState!==t.CONNECTING?d(e):u.push(e)},finishSend:function(){t&&t.readyState!==t.CONNECTING?d(r.FINISH_SEND):u.push(r.FINISH_SEND)},start:function(r){(t=new WebSocket(n,["grpc-websockets"])).binaryType="arraybuffer",t.onopen=function(){var n;e.debug&&o.debug("websocketRequest.onopen"),t.send((n="",r.forEach(function(e,t){n+=e+": "+t.join(", ")+"\r\n"}),i.encodeASCII(n))),u.forEach(function(e){d(e)})},t.onclose=function(t){e.debug&&o.debug("websocketRequest.onclose",t),s.default(function(){e.onEnd()})},t.onerror=function(t){e.debug&&o.debug("websocketRequest.onerror",t)},t.onmessage=function(t){s.default(function(){e.onChunk(new Uint8Array(t.data))})}},cancel:function(){e.debug&&o.debug("websocket.abort"),s.default(function(){t.close()})}}}(e)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(0),o=n(3);t.unary=function(e,t){if(e.responseStream)throw new Error(".unary cannot be used with server-streaming methods. Use .invoke or .client instead.");if(e.requestStream)throw new Error(".unary cannot be used with client-streaming methods. Use .client instead.");var n=null,s=null,i=o.client(e,{host:t.host,transport:t.transport,debug:t.debug});return i.onHeaders(function(e){n=e}),i.onMessage(function(e){s=e}),i.onEnd(function(e,o,i){t.onEnd({status:e,statusMessage:o,headers:n||new r.Metadata,message:s,trailers:i})}),i.start(t.metadata),i.send(t.request),i.finishSend(),{close:function(){i.close()}}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(16);var o=function(){function e(e,t){void 0===e&&(e={}),void 0===t&&(t={splitValues:!1});var n,o=this;if(this.headersMap={},e)if("undefined"!=typeof Headers&&e instanceof Headers)r.getHeaderKeys(e).forEach(function(n){r.getHeaderValues(e,n).forEach(function(e){t.splitValues?o.append(n,r.splitHeaderValue(e)):o.append(n,e)})});else if("object"==typeof(n=e)&&"object"==typeof n.headersMap&&"function"==typeof n.forEach)e.forEach(function(e,t){o.append(e,t)});else if("undefined"!=typeof Map&&e instanceof Map){e.forEach(function(e,t){o.append(t,e)})}else"string"==typeof e?this.appendFromString(e):"object"==typeof e&&Object.getOwnPropertyNames(e).forEach(function(t){var n=e[t];Array.isArray(n)?n.forEach(function(e){o.append(t,e)}):o.append(t,n)})}return e.prototype.appendFromString=function(e){for(var t=e.split("\r\n"),n=0;n<t.length;n++){var r=t[n],o=r.indexOf(":");if(o>0){var s=r.substring(0,o).trim(),i=r.substring(o+1).trim();this.append(s,i)}}},e.prototype.delete=function(e,t){var n=r.normalizeName(e);if(void 0===t)delete this.headersMap[n];else{var o=this.headersMap[n];if(o){var s=o.indexOf(t);s>=0&&o.splice(s,1),0===o.length&&delete this.headersMap[n]}}},e.prototype.append=function(e,t){var n=this,o=r.normalizeName(e);Array.isArray(this.headersMap[o])||(this.headersMap[o]=[]),Array.isArray(t)?t.forEach(function(e){n.headersMap[o].push(r.normalizeValue(e))}):this.headersMap[o].push(r.normalizeValue(t))},e.prototype.set=function(e,t){var n=r.normalizeName(e);if(Array.isArray(t)){var o=[];t.forEach(function(e){o.push(r.normalizeValue(e))}),this.headersMap[n]=o}else this.headersMap[n]=[r.normalizeValue(t)]},e.prototype.has=function(e,t){var n=this.headersMap[r.normalizeName(e)];if(!Array.isArray(n))return!1;if(void 0!==t){var o=r.normalizeValue(t);return n.indexOf(o)>=0}return!0},e.prototype.get=function(e){var t=this.headersMap[r.normalizeName(e)];return void 0!==t?t.concat():[]},e.prototype.forEach=function(e){var t=this;Object.getOwnPropertyNames(this.headersMap).forEach(function(n){e(n,t.headersMap[n])},this)},e.prototype.toHeaders=function(){if("undefined"!=typeof Headers){var e=new Headers;return this.forEach(function(t,n){n.forEach(function(n){e.append(t,n)})}),e}throw new Error("Headers class is not defined")},e}();t.BrowserHeaders=o},function(e,t){e.exports={iterateHeaders:function(e,t){for(var n=e[Symbol.iterator](),r=n.next();!r.done;)t(r.value[0]),r=n.next()},iterateHeadersKeys:function(e,t){for(var n=e.keys(),r=n.next();!r.done;)t(r.value),r=n.next()}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(15);function o(e){return e}t.normalizeName=function(e){if("string"!=typeof e&&(e=String(e)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(e))throw new TypeError("Invalid character in header field name");return e.toLowerCase()},t.normalizeValue=function(e){return"string"!=typeof e&&(e=String(e)),e},t.getHeaderValues=function(e,t){var n=o(e);if(n instanceof Headers&&n.getAll)return n.getAll(t);var r=n.get(t);return r&&"string"==typeof r?[r]:r},t.getHeaderKeys=function(e){var t=o(e),n={},s=[];return t.keys?r.iterateHeadersKeys(t,function(e){n[e]||(n[e]=!0,s.push(e))}):t.forEach?t.forEach(function(e,t){n[t]||(n[t]=!0,s.push(t))}):r.iterateHeaders(t,function(e){var t=e[0];n[t]||(n[t]=!0,s.push(t))}),s},t.splitHeaderValue=function(e){var t=[];return e.split(", ").forEach(function(e){e.split(",").forEach(function(e){t.push(e)})}),t}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(4),o=n(6),s=n(7),i=n(12),a=n(9),u=n(8),d=n(5),c=n(11),p=n(13),f=n(3);!function(e){e.setDefaultTransport=o.setDefaultTransportFactory,e.CrossBrowserHttpTransport=u.CrossBrowserHttpTransport,e.FetchReadableStreamTransport=s.FetchReadableStreamTransport,e.XhrTransport=a.XhrTransport,e.WebsocketTransport=i.WebsocketTransport,e.Code=d.Code,e.Metadata=r.BrowserHeaders,e.client=function(e,t){return f.client(e,t)},e.invoke=c.invoke,e.unary=p.unary}(t.grpc||(t.grpc={}))},function(e,t,n){"use strict";var r;function o(){if(void 0!==r)return r;if(XMLHttpRequest){r=new XMLHttpRequest;try{r.open("GET","https://localhost")}catch(e){}}return r}function s(e){var t=o();if(!t)return!1;try{return t.responseType=e,t.responseType===e}catch(e){}return!1}Object.defineProperty(t,"__esModule",{value:!0}),t.xhrSupportsResponseType=s,t.detectMozXHRSupport=function(){return"undefined"!=typeof XMLHttpRequest&&s("moz-chunked-arraybuffer")},t.detectXHROverrideMimeTypeSupport=function(){return"undefined"!=typeof XMLHttpRequest&&XMLHttpRequest.prototype.hasOwnProperty("overrideMimeType")}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.frameRequest=function(e){var t=e.serializeBinary(),n=new ArrayBuffer(t.byteLength+5);return new DataView(n,1,4).setUint32(0,t.length,!1),new Uint8Array(n,5).set(t),new Uint8Array(n)}}])},e.exports=r()}]).grpc;