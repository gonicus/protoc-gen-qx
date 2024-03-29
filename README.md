# Create Qooxdoo classes from proto files

protoc-gen-qx is a plugin for the `protoc` code generator. It creates
qooxdoo class definitions from proto-files.

The generated code can be used as any other external library, by including
it in your compile.json/config.json.

Usage:

```sh
$ protoc \
    -Iproto \
    --plugin=protoc-gen-qx=./node-modules/.bin/protoc-gen-qx \
    --qx_out=generated \
    api.proto
```

> If you add this code as a script entry in your package.json or install the protoc-gen-qx
> plugin globally, you do not have to define the plugin path.
> ```json
> "scripts": {
>    "protogen": "protoc -Iproto --qx_out=generated api.proto"
>  }
>```
> Execute the script with `npm run protogen`

This example generates an external qooxdoo library from the `api.proto`
file in the `proto` subfolder. You can include this library in your
project by adding it as external library. e.g by adding this code to your
config.json.

```json
"libraries": {
  "library": [
    {
      "manifest" : "./generated/Manifest.json"
    }
  ]
}
```

## Notes

The generated code has two dependencies, which are both automatically loaded in the defer method
of the BaseMessage class in the generated code. As both libraries do not provide as browser-ready,
this plugin uses webpack to convert them.

1. google-protobuf (<https://www.npmjs.com/package/google-protobuf>)
2. gRPC Web implementation by improbable (<https://www.npmjs.com/package/grpc-web-client)>

These dependencies are automatically loaded using the DynamicScriptLoader in the proto.core.BaseMessage classes defer method
(you can turn off this behaviour by an config option).
If you experience errors with missing dependencies, you have to include the generated dependency files as scripts to make them
available before the qooxdoo classes are loaded.

If you use the new qooxdoo-compiler you do not have to to anything as the compiler reads the `externalResources` declaration
from the generated Manifest.json.

If you use the `generate.py` script to build your application you have to add the dependencies to your `config.json` file, e.g.:

```json
"add-script": [
  { "uri": "resource/proto/google-protobuf.js"},
  { "uri": "resource/proto/grpc-web-client.js"}
]
```

> Make sure that you have copied those files to the resources folder of your project before generating your application.

## Plugin parameters

You can add parameters to the plugin by using the following format:

`--qx_out=paramName=paramValue,booleanParam:<output-path>`

The plugin reads the following parameters:

`skipDeps`:
A boolean parameter which disables the external dependency generation.
Usually those scripts have to be generated only once, so you can skip
this step in further code generation calls to save some time.

Example:

```sh
$ protoc \
    -Iproto \
    --plugin=protoc-gen-qx=./node-modules/.bin/protoc-gen-qx \
    --qx_out=skipDeps:generated \
    api.proto
```

`dump`:
Dumps the parsed proto files as JSON-String.

## Code customizations

Some parts of the genererated code can be adjusted by a custom configuration file,
e.g. you can include own mixins in the generated messageType classes or
let them extend other classes.

For a list of available options have a look at the `config.js` file in this plugins
root folder.

To override these default settings you have to add a file named `protoc-gen-qx.config.js`
in the folder where you run your code generation from.

The default config looks like this:

```javascript
module.exports = {
  baseNamespace: 'proto',
  messageType: {
    '*': {
      // relative to baseNamespace (starting with .)
      extend: '.core.BaseMessage',
      include: [],
      implement: []
    }
  },
  service: {
    '*': {
      // relative to baseNamespace (starting with .)
      extend: '.core.BaseService',
      include: [],
      implement: []
    }
  },
  // list of external dependencies that need to be requires (e.g. for extensions)
  require: []
  // skip generation and including of selected external libraries (filename needed, e.g. google-protobuf.js or grpc-web-client.js)
  skipDeps: [],
  // if true: do not add the fallback loading of external dependencies to proto.core.BaseMessage' defer method
  skipDepLoadingFallback: false,
  // do not end lines of generated code with ';' if true
  withoutSemi: false,
  // class to use for repeated properties
  repeatedClass: 'qx.data.Array',
  // code to append to any repeatedClass reference to transform it into a plain array, if necessary (leave empty if no transform is necessary)
  repeatedClassTransform: '.toArray()',
  // static classes that provide property validation methods (like qx.util.Validate)
  // these classes are registered in the proto.util.ValidationFactory
  validatorClasses: [],
  // Field option handlers (for example see: handlers/options/qx.js)
  optionHandlers: []
}
```

If you want to include a certain mixin in a messageType class you can use this config:

```javascript
module.exports = {
  messageType: {
    'proto.api.MyMessage': {
      // relative to baseNamespace (starting with .)
      include: ['my.MMixin']
    }
  }
}
```

You can also use regular expression as class selectors:

```javascript
module.exports = {
  messageType: {
    '/proto.api.(MyMessage|MyOtherMessage)/': {
      // relative to baseNamespace (starting with .)
      include: ['my.MMixin']
    }
  }
}
```

## Property annotations

The protoc generator supports qooxdoos own annotations on property level by providing an own FieldOption for that purpose.
You can declare an annotation for a property like this:

```proto
import "node_modules/protoc-gen-qx/protos/extensions.proto";

message User {
    uint64 uid = 1 [(qx).annotations = 'primary,test'];
}
```

which will generate this property definition:

```js
 uid: {
  check: 'String',
  init: 0,
  event: 'changeUid',
  transform: '_toString',
  "@": ['primary', 'test']
},
```

## Custom FieldOptions

It is possible to use other FieldOptions from any proto-file as its done with the annotations described above.
To make them usable a javascript file has to be generated from the proto-file containing the extensions:
`protoc --js_out=import_style=commonjs,binary:. my-extension-file.proto` and this file needs to be included via
the config file: `require: ['my-extension-file_pb']`.

When this is done, custom handlers for the custom field options can be written and must also be added via config file:
`optionHandlers: ['my-option-handler'].

A simple example for the custom option handler for an option named `nullable`:

```js
const {setPropEntry} = require('protoc-gen-qx/utils')

module.exports = {
  name: 'nullable',
  handler: function (value, propertyDefinition, context) {
    setPropEntry(propertyDefinition.entries, 'nullable', value)
  }
}
```

is sets the `nullable` value of a property.

Full example using <https://github.com/gogo/protobuf/blob/master/gogoproto/gogo.proto>:

1. Download gogo.proto file and generate the javascript version from it:
   `protoc --js_out=import_style=commonjs,binary:. gogo.proto`

2. Include and use it in your proto files:

    ```proto
    import "gogo.proto";

    message Object {
        string uid = 1 [(gogoproto.nullable) = false];
    }
    ```

3. Include the generated gogoproto javascript file and the option handler for the nullable option (see above) into the plugin config (`protoc-gen-qx.config.js`)

    ```js
    ...
    require: ['./gogo_pb'],
    optionHandlers: ['./nullable.js']
    ...
    ```

4. Run the generator.
