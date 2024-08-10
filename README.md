grapi-cli
=================

a cli tool to generate loopback 4 applications with extra features like caching & fuzzy search

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g grapi-cli
$ grapi-cli COMMAND
running command...
$ grapi-cli (--version)
grapi-cli/1.0.19 linux-x64 node-v18.17.1
$ grapi-cli --help [COMMAND]
USAGE
  $ grapi-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`grapi-cli app [NAME]`](#grapi-cli-app-name)
* [`grapi-cli auth`](#grapi-cli-auth)
* [`grapi-cli auth:users`](#grapi-cli-authusers)
* [`grapi-cli cache`](#grapi-cli-cache)
* [`grapi-cli controller [NAME]`](#grapi-cli-controller-name)
* [`grapi-cli copyright`](#grapi-cli-copyright)
* [`grapi-cli datasource [NAME]`](#grapi-cli-datasource-name)
* [`grapi-cli discover [URL]`](#grapi-cli-discover-url)
* [`grapi-cli example [EXAMPLE-NAME]`](#grapi-cli-example-example-name)
* [`grapi-cli extension [NAME]`](#grapi-cli-extension-name)
* [`grapi-cli external:operation`](#grapi-cli-externaloperation)
* [`grapi-cli fuzzy`](#grapi-cli-fuzzy)
* [`grapi-cli help [COMMAND]`](#grapi-cli-help-command)
* [`grapi-cli import-lb3-models [LB3APP]`](#grapi-cli-import-lb3-models-lb3app)
* [`grapi-cli interceptor NAME`](#grapi-cli-interceptor-name)
* [`grapi-cli model [NAME]`](#grapi-cli-model-name)
* [`grapi-cli model:remove`](#grapi-cli-modelremove)
* [`grapi-cli observer NAME`](#grapi-cli-observer-name)
* [`grapi-cli openapi [URL]`](#grapi-cli-openapi-url)
* [`grapi-cli plugins`](#grapi-cli-plugins)
* [`grapi-cli plugins:add PLUGIN`](#grapi-cli-pluginsadd-plugin)
* [`grapi-cli plugins:inspect PLUGIN...`](#grapi-cli-pluginsinspect-plugin)
* [`grapi-cli plugins:install PLUGIN`](#grapi-cli-pluginsinstall-plugin)
* [`grapi-cli plugins:link PATH`](#grapi-cli-pluginslink-path)
* [`grapi-cli plugins:remove [PLUGIN]`](#grapi-cli-pluginsremove-plugin)
* [`grapi-cli plugins:reset`](#grapi-cli-pluginsreset)
* [`grapi-cli plugins:uninstall [PLUGIN]`](#grapi-cli-pluginsuninstall-plugin)
* [`grapi-cli plugins:unlink [PLUGIN]`](#grapi-cli-pluginsunlink-plugin)
* [`grapi-cli plugins:update`](#grapi-cli-pluginsupdate)
* [`grapi-cli property:add`](#grapi-cli-propertyadd)
* [`grapi-cli property:remove`](#grapi-cli-propertyremove)
* [`grapi-cli relation`](#grapi-cli-relation)
* [`grapi-cli repository [NAME]`](#grapi-cli-repository-name)
* [`grapi-cli rest-crud`](#grapi-cli-rest-crud)
* [`grapi-cli service NAME`](#grapi-cli-service-name)
* [`grapi-cli sql-controller`](#grapi-cli-sql-controller)
* [`grapi-cli update`](#grapi-cli-update)
* [`grapi-cli update:model`](#grapi-cli-updatemodel)

## `grapi-cli app [NAME]`

generate application.

```
USAGE
  $ grapi-cli app [NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--name <value>]
    [--description <value>] [--outdir <value>] [--eslint] [--prettier] [--mocha] [--loopbackBuild] [--vscode] [--docker]
    [--repositories] [--services] [--apiconnect]

ARGUMENTS
  NAME  name of the application.

FLAGS
  -c, --config=<value>       Config JSON object
  -h, --help                 Print the generator’s options and usage.
  -y, --yes                  Skip all confirmation prompts with default or provided value.
      --apiconnect           Include ApiConnectComponent.
      --description=<value>  Description of the application.
      --docker               Generate Dockerfile and add npm scripts to build/run the project in a docker container.
      --eslint               Add ESLint to LoopBack4 application project.
      --loopbackBuild        Add @loopback/build module’s script set to LoopBack4 application project.
      --mocha                Add Mocha to LoopBack4 application project.
      --name=<value>         Application class name.
      --outdir=<value>       Project root directory for the application.
      --prettier             Add Prettier to LoopBack4 application project.
      --repositories         include repository imports and RepositoryMixin.
      --services             include service-proxy imports and ServiceMixin.
      --skip-cache           Do not remember prompt answers. Default is false.
      --skip-install         Do not automatically install dependencies. Default is false.
      --vscode               Add VSCode config files to LoopBack4 application project

DESCRIPTION
  generate application.
```

_See code: [src/commands/app.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/app.ts)_

## `grapi-cli auth`

adding auth to loopback 4 application.

```
USAGE
  $ grapi-cli auth [-c <value>] [-i <value>] [-e <value>] [-r <value>]

FLAGS
  -c, --config=<value>    Config JSON object
  -e, --exclude=<value>   exclude auth to the apis.
  -i, --include=<value>   include auth to the apis.
  -r, --readonly=<value>  auth to readonly apis.

DESCRIPTION
  adding auth to loopback 4 application.
```

_See code: [src/commands/auth.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/auth.ts)_

## `grapi-cli auth:users`

adding auth to loopback 4 application.

```
USAGE
  $ grapi-cli auth:users [-c <value>] [-i <value>]

FLAGS
  -c, --config=<value>  Config JSON object
  -i, --users=<value>   users list.

DESCRIPTION
  adding auth to loopback 4 application.
```

_See code: [src/commands/auth/users.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/auth/users.ts)_

## `grapi-cli cache`

creating cache for endpoints

```
USAGE
  $ grapi-cli cache [-c <value>] [--redisDS <value>] [--TTL <value>] [--prefix <value>] [--exclude <value>]
    [--include <value>]

FLAGS
  -c, --config=<value>    Config JSON object
      --cacheTTL=<value>  cacheTTL
      --exclude=<value>   exclude controllers
      --include=<value>   include controllers
      --prefix=<value>    prefix to append to endpoints.
      --redisDS=<value>   redisDS

DESCRIPTION
  creating cache for endpoints
```

_See code: [src/commands/cache.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/cache.ts)_

## `grapi-cli controller [NAME]`

generate controllers

```
USAGE
  $ grapi-cli controller [NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--Type REST|BASIC]

ARGUMENTS
  NAME  name of controller.

FLAGS
  -c, --config=<value>           Config JSON object
  -h, --help                     Print the generator’s options and usage.
  -y, --yes                      Skip all confirmation prompts with default or provided value.
      --controllerType=<option>  Type of the controller. Valid types are BASIC and REST. BASIC corresponds to an empty
                                 controller, whereas REST corresponds to REST controller with CRUD methods.
                                 <options: REST|BASIC>
      --skip-cache               Do not remember prompt answers. Default is false.
      --skip-install             Do not automatically install dependencies. Default is false.

DESCRIPTION
  generate controllers
```

_See code: [src/commands/controller.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/controller.ts)_

## `grapi-cli copyright`

add/update copyright

```
USAGE
  $ grapi-cli copyright [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--owner <value>] [--license
    <value>] [--gitOnly <value>] [--updateLicense <value>] [--exclude <value>]

FLAGS
  -c, --config=<value>         Config JSON object
  -h, --help                   Print the generator’s options and usage.
  -y, --yes                    Skip all confirmation prompts with default or provided value.
      --exclude=<value>        One or more glob patterns with , delimiter to exclude files that match the patterns from
                               being updated.
      --gitOnly=<value>        A flag to control if only git tracked files are updated. Default to true.
      --license=<value>        The name of the license, such as MIT.
      --owner=<value>          The owner of the copyright, such as IBM Corp. and LoopBack contributors.
      --skip-cache             Do not remember prompt answers. Default is false.
      --skip-install           Do not automatically install dependencies. Default is false.
      --updateLicense=<value>  A flag to control if package.json and LICENSE files should be updated to reflect the
                               selected license id.

DESCRIPTION
  add/update copyright
```

_See code: [src/commands/copyright.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/copyright.ts)_

## `grapi-cli datasource [NAME]`

generate datasource.

```
USAGE
  $ grapi-cli datasource [NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--connector <value>]

ARGUMENTS
  NAME  name of the datasource.

FLAGS
  -c, --config=<value>     Config JSON object
  -h, --help               Print the generator’s options and usage.
  -y, --yes                Skip all confirmation prompts with default or provided value.
      --connector=<value>  Name of datasource connector.
      --skip-cache         Do not remember prompt answers. Default is false.
      --skip-install       Do not automatically install dependencies. Default is false.

DESCRIPTION
  generate datasource.
```

_See code: [src/commands/datasource.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/datasource.ts)_

## `grapi-cli discover [URL]`

discover models.

```
USAGE
  $ grapi-cli discover [URL] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--dataSource <value>]
    [--views] [--relations] [--all] [--outDir <value>] [--schema <value>] [--models <value>] [--optionalId]
    [--connectorDiscoveryOptions <value>]

ARGUMENTS
  URL  URL or file path of the OpenAPI spec. Type: String. Required: false.

FLAGS
  -c, --config=<value>                     Config JSON object
  -h, --help                               Print the generator’s options and usage.
  -y, --yes                                Skip all confirmation prompts with default or provided value.
      --all                                Skips the model prompt and discovers all of them.
      --connectorDiscoveryOptions=<value>  Pass the options to the connectors.
      --dataSource=<value>                 Put a valid datasource name here to skip the datasource prompt.
      --models=<value>                     Specify the models to be generated e.g:–models=table1,table2.
      --optionalId                         Specify if the Id property of generated models will be marked as not
                                           required.
      --outDir=<value>                     Specify the directory into which the model.model.ts files will be placed.
                                           Default is src/models.
      --relations                          Choose whether to create relations.
      --schema=<value>                     Specify the schema which the datasource will find the models to discover.
      --skip-cache                         Do not remember prompt answers. Default is false.
      --skip-install                       Do not automatically install dependencies. Default is false.
      --views                              Choose whether to discover views.

DESCRIPTION
  discover models.
```

_See code: [src/commands/discover.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/discover.ts)_

## `grapi-cli example [EXAMPLE-NAME]`

download examples.

```
USAGE
  $ grapi-cli example [EXAMPLE-NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install]

ARGUMENTS
  EXAMPLE-NAME  Optional name of the example to clone. If provided, the tool will skip the example-name prompt and run
                in a non-interactive mode.

FLAGS
  -c, --config=<value>  Config JSON object
  -h, --help            Print the generator’s options and usage.
  -y, --yes             Skip all confirmation prompts with default or provided value.
      --skip-cache      Do not remember prompt answers. Default is false.
      --skip-install    Do not automatically install dependencies. Default is false.

DESCRIPTION
  download examples.
```

_See code: [src/commands/example.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/example.ts)_

## `grapi-cli extension [NAME]`

generate extension.

```
USAGE
  $ grapi-cli extension [NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--description <value>]
    [--outDir <value>] [--eslint] [--prettier] [--mocha] [--loopbackBuild] [--vscode]

ARGUMENTS
  NAME  Optional name of the extension given as an argument to the command.

FLAGS
  -c, --config=<value>       Config JSON object
  -h, --help                 Print the generator’s options and usage.
  -y, --yes                  Skip all confirmation prompts with default or provided value.
      --description=<value>  project root directory for the extension.
      --eslint               Add ESLint to LoopBack4 extension project.
      --loopbackBuild        Add @loopback/build module’s script set to LoopBack4 extension project.
      --mocha                Add Mocha to LoopBack4 extension projectAdd @loopback/build module’s script set to
                             LoopBack4 extension project.
      --outDir=<value>       Project root directory for the extension.
      --prettier             Add Prettier to LoopBack4 extension project.
      --skip-cache           Do not remember prompt answers. Default is false.
      --skip-install         Do not automatically install dependencies. Default is false.
      --vscode               Add VSCode config files to LoopBack4 application project.

DESCRIPTION
  generate extension.
```

_See code: [src/commands/extension.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/extension.ts)_

## `grapi-cli external:operation`

adding auth to loopback 4 application.

```
USAGE
  $ grapi-cli external:operation [-c <value>] [--ds <value>] [--method <value>] [--bodyParams <value>] [--pathParams
    <value>] [--url <value>] [--headers <value>] [--query <value>] [--apiFunction <value>] [--name <value>] [--apiUri
    <value>] [--type <value>] [--controller <value>]

FLAGS
  -c, --config=<value>       Config JSON object
      --apiFunction=<value>  api function name.
      --apiUri=<value>       uri of the controller.
      --bodyParams=<value>   Stringified JSON Object for request body.
      --controller=<value>   controller under which the API should reside.
      --ds=<value>           datasource name to attach APIs to.
      --headers=<value>      Stringified JSON Object for headers.
      --method=<value>       api method type.
      --name=<value>         name of the artifacts.
      --pathParams=<value>   Stringified JSON Object for path parameter.
      --query=<value>        Stringified JSON Object for query parameters.
      --type=<value>         type of return data.
      --url=<value>          url of the external api.

DESCRIPTION
  adding auth to loopback 4 application.
```

_See code: [src/commands/external/operation.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/external/operation.ts)_

## `grapi-cli fuzzy`

generate fuzzy endpoints for lb4 based controllers

```
USAGE
  $ grapi-cli fuzzy [-c <value>] [-- <value>] [--centralFuzzy <value>] [--datasource <value>] [--appName
    <value>] [--exclude <value>] [--include <value>]

FLAGS
  -c, --config=<value>        Config JSON object
      --appName=<value>       name of the application
      --centralFuzzy=<value>  central Fuzzy
      --datasource=<value>    datasource name
      --exclude=<value>       exclude controllers
      --fuzzy=<value>         fuzzy
      --include=<value>       include controllers

DESCRIPTION
  generate fuzzy endpoints for lb4 based controllers
```

_See code: [src/commands/fuzzy.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/fuzzy.ts)_

## `grapi-cli help [COMMAND]`

Display help for grapi-cli.

```
USAGE
  $ grapi-cli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for grapi-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.21/src/commands/help.ts)_

## `grapi-cli import-lb3-models [LB3APP]`

import lb3 models.

```
USAGE
  $ grapi-cli import-lb3-models [LB3APP] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--outDir <value>]

ARGUMENTS
  LB3APP  Path to the directory containing your LoopBack 3.x application.

FLAGS
  -c, --config=<value>  Config JSON object
  -h, --help            Print the generator’s options and usage.
  -y, --yes             Skip all confirmation prompts with default or provided value.
      --outDir=<value>  [default: src/models] Directory where to write the generated source file. Default: src/models.
      --skip-cache      Do not remember prompt answers. Default is false.
      --skip-install    Do not automatically install dependencies. Default is false.

DESCRIPTION
  import lb3 models.
```

_See code: [src/commands/import-lb3-models.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/import-lb3-models.ts)_

## `grapi-cli interceptor NAME`

generate interceptor.

```
USAGE
  $ grapi-cli interceptor NAME [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--global] [--no-global]
    [--group <value>]

ARGUMENTS
  NAME  Required name of the observer to create as an argument to the command.

FLAGS
  -c, --config=<value>  Config JSON object
  -h, --help            Print the generator’s options and usage.
  -y, --yes             Skip all confirmation prompts with default or provided value.
      --global          Optional flag to indicate a global interceptor (default to true). Use --no-global to set it to
                        false.
      --group=<value>   Optional name of the interceptor group to sort the execution of global interceptors by group.
                        This option is only supported for global interceptors.
      --no-global       set global to false
      --skip-cache      Do not remember prompt answers. Default is false.
      --skip-install    Do not automatically install dependencies. Default is false.

DESCRIPTION
  generate interceptor.
```

_See code: [src/commands/interceptor.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/interceptor.ts)_

## `grapi-cli model [NAME]`

generate model.

```
USAGE
  $ grapi-cli model [NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--base <value>]
    [--dataSource <value>] [--table <value>] [--schema <value>]

ARGUMENTS
  NAME  name of the model.

FLAGS
  -c, --config=<value>      Config JSON object
  -h, --help                Print the generator’s options and usage.
  -y, --yes                 Skip all confirmation prompts with default or provided value.
      --base=<value>        a valid model already created in src/models or any of the core based class models Entity or
                            Model. Your new model will extend this selected base model class
      --dataSource=<value>  The name of the dataSource which contains this model and suppots model discovery
      --schema=<value>      If discovering a model from a dataSource, specify the schema which contains it
      --skip-cache          Do not remember prompt answers. Default is false.
      --skip-install        Do not automatically install dependencies. Default is false.
      --table=<value>       If discovering a model from a dataSource, specify the name of its table/view

DESCRIPTION
  generate model.
```

_See code: [src/commands/model.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/model.ts)_

## `grapi-cli model:remove`

enable adding property to loopoback 4 models

```
USAGE
  $ grapi-cli model:remove [-c <value>] [-n <value>]

FLAGS
  -c, --config=<value>  Config JSON object
  -n, --model=<value>   name of the model to remove.

DESCRIPTION
  enable adding property to loopoback 4 models
```

_See code: [src/commands/model/remove.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/model/remove.ts)_

## `grapi-cli observer NAME`

generate observer.

```
USAGE
  $ grapi-cli observer NAME [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--group <value>]

ARGUMENTS
  NAME  Required name of the observer to create as an argument to the command.

FLAGS
  -c, --config=<value>  Config JSON object
  -h, --help            Print the generator’s options and usage.
  -y, --yes             Skip all confirmation prompts with default or provided value.
      --group=<value>   Optional name of the observer group to sort the execution of observers by group.
      --skip-cache      Do not remember prompt answers. Default is false.
      --skip-install    Do not automatically install dependencies. Default is false.

DESCRIPTION
  generate observer.
```

_See code: [src/commands/observer.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/observer.ts)_

## `grapi-cli openapi [URL]`

generate openapi based apis.

```
USAGE
  $ grapi-cli openapi [URL] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--url <value>]
    [--validate] [--promote-anonymous-schemas] [--client] [--datasource <value>] [--positional]

ARGUMENTS
  URL  URL or file path of the OpenAPI spec. Type: String. Required: false.

FLAGS
  -c, --config=<value>             Config JSON object
  -h, --help                       Print the generator’s options and usage.
  -y, --yes                        Skip all confirmation prompts with default or provided value.
      --client                     Generate client-side service proxies and controllers with implementation for the
                                   OpenAPI spec.
      --datasource=<value>         A valid datasource name.
      --positional                 A flag to control if service methods use positional parameters or an object with
                                   named properties.
      --promote-anonymous-schemas  Promote anonymous schemas as models classes.
      --skip-cache                 Do not remember prompt answers. Default is false.
      --skip-install               Do not automatically install dependencies. Default is false.
      --url=<value>                URL or file path of the OpenAPI spec.
      --validate                   Validate the OpenAPI spec.

DESCRIPTION
  generate openapi based apis.
```

_See code: [src/commands/openapi.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/openapi.ts)_

## `grapi-cli plugins`

List installed plugins.

```
USAGE
  $ grapi-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ grapi-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/index.ts)_

## `grapi-cli plugins:add PLUGIN`

Installs a plugin into grapi-cli.

```
USAGE
  $ grapi-cli plugins:add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into grapi-cli.

  Uses bundled npm executable to install plugins into /home/aaqilniz/.local/share/grapi-cli

  Installation of a user-installed plugin will override a core plugin.

  Use the GRAPI_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the GRAPI_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ grapi-cli plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ grapi-cli plugins:add myplugin

  Install a plugin from a github url.

    $ grapi-cli plugins:add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ grapi-cli plugins:add someuser/someplugin
```

## `grapi-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ grapi-cli plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ grapi-cli plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/inspect.ts)_

## `grapi-cli plugins:install PLUGIN`

Installs a plugin into grapi-cli.

```
USAGE
  $ grapi-cli plugins:install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into grapi-cli.

  Uses bundled npm executable to install plugins into /home/aaqilniz/.local/share/grapi-cli

  Installation of a user-installed plugin will override a core plugin.

  Use the GRAPI_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the GRAPI_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ grapi-cli plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ grapi-cli plugins:install myplugin

  Install a plugin from a github url.

    $ grapi-cli plugins:install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ grapi-cli plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/install.ts)_

## `grapi-cli plugins:link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ grapi-cli plugins:link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ grapi-cli plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/link.ts)_

## `grapi-cli plugins:remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ grapi-cli plugins:remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ grapi-cli plugins:unlink
  $ grapi-cli plugins:remove

EXAMPLES
  $ grapi-cli plugins:remove myplugin
```

## `grapi-cli plugins:reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ grapi-cli plugins:reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/reset.ts)_

## `grapi-cli plugins:uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ grapi-cli plugins:uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ grapi-cli plugins:unlink
  $ grapi-cli plugins:remove

EXAMPLES
  $ grapi-cli plugins:uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/uninstall.ts)_

## `grapi-cli plugins:unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ grapi-cli plugins:unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ grapi-cli plugins:unlink
  $ grapi-cli plugins:remove

EXAMPLES
  $ grapi-cli plugins:unlink myplugin
```

## `grapi-cli plugins:update`

Update installed plugins.

```
USAGE
  $ grapi-cli plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/update.ts)_

## `grapi-cli property:add`

enable adding property to loopoback 4 models

```
USAGE
  $ grapi-cli property:add [-c <value>] [-n <value>] [-t <value>]

FLAGS
  -c, --config=<value>      Config JSON object
  -n, --model=<value>       name of the argument
  -t, --properties=<value>  JSON object of properties to add

DESCRIPTION
  enable adding property to loopoback 4 models
```

_See code: [src/commands/property/add.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/property/add.ts)_

## `grapi-cli property:remove`

enable adding property to loopoback 4 models

```
USAGE
  $ grapi-cli property:remove [-c <value>] [-n <value>] [-t <value>]

FLAGS
  -c, --config=<value>    Config JSON object
  -n, --model=<value>     name of the argument
  -t, --property=<value>  name of the property to remove.

DESCRIPTION
  enable adding property to loopoback 4 models
```

_See code: [src/commands/property/remove.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/property/remove.ts)_

## `grapi-cli relation`

generate relations.

```
USAGE
  $ grapi-cli relation [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--Type <value>] [--sourceModel
    <value>] [--destinationModel <value>] [--throughModel <value>] [--sourceModelPrimaryKey <value>]
    [--sourceModelPrimaryKeyType <value>] [--destinationModelPrimaryKey <value>] [--destinationModelPrimaryKeyType
    <value>] [--foreignKeyName <value>] [--Name <value>] [--sourceKeyOnThrough <value>] [--targetKeyOnThrough <value>]

FLAGS
  -c, --config=<value>                          Config JSON object
  -h, --help                                    Print the generator’s options and usage.
  -y, --yes                                     Skip all confirmation prompts with default or provided value.
      --destinationModel=<value>                Destination model.
      --destinationModelPrimaryKey=<value>      The name of the primary key of the destination model.
      --destinationModelPrimaryKeyType=<value>  The type of the primary key of the destination model.
      --foreignKeyName=<value>                  Destination/Source model foreign key name for HasMany,HasOne/BelongsTo
                                                relation, respectively.
      --relationName=<value>                    Relation name.
      --relationType=<value>                    Relation type.
      --skip-cache                              Do not remember prompt answers. Default is false.
      --skip-install                            Do not automatically install dependencies. Default is false.
      --sourceKeyOnThrough=<value>              Foreign key that references the source model on the through model. For
                                                HasManyThrough relation only.
      --sourceModel=<value>                     Source model.
      --sourceModelPrimaryKey=<value>           The name of the primary key of the source model.
      --sourceModelPrimaryKeyType=<value>       The type of the primary key of the source model.
      --targetKeyOnThrough=<value>              Foreign key that references the target model on the through model. For
                                                HasManyThrough relation only.
      --throughModel=<value>                    Through model. For HasManyThrough relation only.

DESCRIPTION
  generate relations.
```

_See code: [src/commands/relation.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/relation.ts)_

## `grapi-cli repository [NAME]`

generate repositories.

```
USAGE
  $ grapi-cli repository [NAME] [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--datasource <value>]
    [--model <value>] [--id <value>] [--BaseClass <value>]

ARGUMENTS
  NAME  name of the repository.

FLAGS
  -c, --config=<value>               Config JSON object
  -h, --help                         Print the generator’s options and usage.
  -y, --yes                          Skip all confirmation prompts with default or provided value.
      --datasource=<value>           name of a valid datasource already created in src/datasources.
      --id=<value>                   name of the property serving as ID in the selected model. If you supply this value,
                                     the CLI will not try to infer this value from the selected model file.
      --model=<value>                name of a valid model already created in src/models.
      --repositoryBaseClass=<value>  (Default: DefaultCrudRepository) name of the base class the repository will
                                     inherit. If no value was supplied, DefaultCrudRepository will be used.
      --skip-cache                   Do not remember prompt answers. Default is false.
      --skip-install                 Do not automatically install dependencies. Default is false.

DESCRIPTION
  generate repositories.
```

_See code: [src/commands/repository.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/repository.ts)_

## `grapi-cli rest-crud`

generate rest crud apis.

```
USAGE
  $ grapi-cli rest-crud [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--datasource <value>] [--model
    <value>] [--basePath <value>] [--readonly <value>]

FLAGS
  -c, --config=<value>      Config JSON object
  -h, --help                Print the generator’s options and usage.
  -y, --yes                 Skip all confirmation prompts with default or provided value.
      --basePath=<value>    base path of the model endpoint.
      --datasource=<value>  name of a valid datasource already created in src/datasources.
      --model=<value>       name of a valid model already created in src/models.
      --readonly=<value>    create readonly APIs e.g find and count.
      --skip-cache          Do not remember prompt answers. Default is false.
      --skip-install        Do not automatically install dependencies. Default is false.

DESCRIPTION
  generate rest crud apis.
```

_See code: [src/commands/rest-crud.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/rest-crud.ts)_

## `grapi-cli service NAME`

generate a service.

```
USAGE
  $ grapi-cli service NAME [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--type <value>]
    [--datasource <value>]

ARGUMENTS
  NAME  name of the service.

FLAGS
  -c, --config=<value>      Config JSON object
  -h, --help                Print the generator’s options and usage.
  -y, --yes                 Skip all confirmation prompts with default or provided value.
      --datasource=<value>  name of a valid REST or SOAP datasource already created in src/datasources.
      --skip-cache          Do not remember prompt answers. Default is false.
      --skip-install        Do not automatically install dependencies. Default is false.
      --type=<value>        service type: proxy, class, or provider.

DESCRIPTION
  generate a service.
```

_See code: [src/commands/service.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/service.ts)_

## `grapi-cli sql-controller`

describe the command here

```
USAGE
  $ grapi-cli sql-controller [-c <value>] [--query <value>] [--path <value>] [--repoName <value>] [--appName
    <value>] [--controllerName <value>]

FLAGS
  -c, --config=<value>          Config JSON object
      --appName=<value>         name of the application
      --controllerName=<value>  name of the generated controller
      --path=<value>            path for endpoint
      --query=<value>           sql query to generate controller for
      --repoName=<value>        repository name

DESCRIPTION
  describe the command here
```

_See code: [src/commands/sql-controller.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/sql-controller.ts)_

## `grapi-cli update`

update application dependencies.

```
USAGE
  $ grapi-cli update [-c <value>] [-y] [-h] [--skip-cache] [--skip-install] [--semver <value>]

FLAGS
  -c, --config=<value>  Config JSON object
  -h, --help            Print the generator’s options and usage.
  -y, --yes             Skip all confirmation prompts with default or provided value.
      --semver=<value>  Use semver semantics to check version compatibility for project dependencies of LoopBack
                        modules.
      --skip-cache      Do not remember prompt answers. Default is false.
      --skip-install    Do not automatically install dependencies. Default is false.

DESCRIPTION
  update application dependencies.
```

_See code: [src/commands/update.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/update.ts)_

## `grapi-cli update:model`

enable updating loopoback 4 models

```
USAGE
  $ grapi-cli update:model [-c <value>] [-n <value>] [--datasource <value>] [--base <value>] [--properties <value>]

FLAGS
  -c, --config=<value>      Config JSON object
  -n, --name=<value>        name of the model
      --base=<value>        base of the model.
      --datasource=<value>  name of the datasource
      --properties=<value>  stringigied object of model properties.

DESCRIPTION
  enable updating loopoback 4 models
```

_See code: [src/commands/update/model.ts](https://github.com/aaqilniz/grapi-cli/blob/v1.0.19/src/commands/update/model.ts)_
<!-- commandsstop -->
