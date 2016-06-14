> Command line interface for node-browser-resolve

# browser-resolve-cli

Provides a thin command line interface for
[node-browser-resolve](https://github.com/defunctzombie/node-browser-resolve),
the module resolving algorithm used by  [browserify](https://github.com/substack/node-browserify)
and friends.

## Installation

Grab it via npm

```bash
# Install globally
npm install -g browser-resolve-cli

# Install locally
npm install browser-resolve-cli
```

## Usage

```
❯ browser-resolve --help

  Command line interface for node-browser-resolve

  Usage
    $ browser-resolve [options] <input>

  Options
    -b, --browser           Property to use from package.json for lookups, defaults to browser
    -d, --basedir           Directory to resolve from, defaults to CWD
    -e, --extensions        Extensions to search in order, repeat for mulitple paths
    -m, --module-directory  Directories to use for module lookups, defaults to node_modules, repeat for multiple directories
    -p, --paths             Paths to search if nothing is found in modules directory, repeat for multiple paths

  Examples
    # Check on the entry file of React
    browser-resolve patternplate
    node_modules/react/react.js

    # Force node resolving
    browser-resolve --browser=main isomorphic-fetch
    node_modules/isomorphic-fetch/fetch-npm-node.js

    # Resolve for rollup
    browser-resolve --browser=jsnext:main redux
    node_modules/redux/es/index.js

    # Create a standalone bundle for a library
    browserify -s jogwheel $(browser-resolve jogwheel) > jogwheel.bundle.js
```

---
Built by Mario Nebl and [contributors](./documentation/contributors.md) and released under the [MIT License](./license.md).
