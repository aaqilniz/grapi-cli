oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

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
grapi-cli/0.0.0 linux-x64 node-v18.17.1
$ grapi-cli --help [COMMAND]
USAGE
  $ grapi-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`grapi-cli hello PERSON`](#grapi-cli-hello-person)
* [`grapi-cli hello world`](#grapi-cli-hello-world)
* [`grapi-cli help [COMMAND]`](#grapi-cli-help-command)
* [`grapi-cli plugins`](#grapi-cli-plugins)
* [`grapi-cli plugins add PLUGIN`](#grapi-cli-plugins-add-plugin)
* [`grapi-cli plugins:inspect PLUGIN...`](#grapi-cli-pluginsinspect-plugin)
* [`grapi-cli plugins install PLUGIN`](#grapi-cli-plugins-install-plugin)
* [`grapi-cli plugins link PATH`](#grapi-cli-plugins-link-path)
* [`grapi-cli plugins remove [PLUGIN]`](#grapi-cli-plugins-remove-plugin)
* [`grapi-cli plugins reset`](#grapi-cli-plugins-reset)
* [`grapi-cli plugins uninstall [PLUGIN]`](#grapi-cli-plugins-uninstall-plugin)
* [`grapi-cli plugins unlink [PLUGIN]`](#grapi-cli-plugins-unlink-plugin)
* [`grapi-cli plugins update`](#grapi-cli-plugins-update)

## `grapi-cli hello PERSON`

Say hello

```
USAGE
  $ grapi-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/patrick/grapi-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `grapi-cli hello world`

Say hello world

```
USAGE
  $ grapi-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ grapi-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/patrick/grapi-cli/blob/v0.0.0/src/commands/hello/world.ts)_

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

## `grapi-cli plugins add PLUGIN`

Installs a plugin into grapi-cli.

```
USAGE
  $ grapi-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  $ grapi-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ grapi-cli plugins add myplugin

  Install a plugin from a github url.

    $ grapi-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ grapi-cli plugins add someuser/someplugin
```

## `grapi-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ grapi-cli plugins inspect PLUGIN...

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
  $ grapi-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/inspect.ts)_

## `grapi-cli plugins install PLUGIN`

Installs a plugin into grapi-cli.

```
USAGE
  $ grapi-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  $ grapi-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ grapi-cli plugins install myplugin

  Install a plugin from a github url.

    $ grapi-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ grapi-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/install.ts)_

## `grapi-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ grapi-cli plugins link PATH [-h] [--install] [-v]

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
  $ grapi-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/link.ts)_

## `grapi-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ grapi-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ grapi-cli plugins unlink
  $ grapi-cli plugins remove

EXAMPLES
  $ grapi-cli plugins remove myplugin
```

## `grapi-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ grapi-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/reset.ts)_

## `grapi-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ grapi-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ grapi-cli plugins unlink
  $ grapi-cli plugins remove

EXAMPLES
  $ grapi-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/uninstall.ts)_

## `grapi-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ grapi-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ grapi-cli plugins unlink
  $ grapi-cli plugins remove

EXAMPLES
  $ grapi-cli plugins unlink myplugin
```

## `grapi-cli plugins update`

Update installed plugins.

```
USAGE
  $ grapi-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.17/src/commands/plugins/update.ts)_
<!-- commandsstop -->
