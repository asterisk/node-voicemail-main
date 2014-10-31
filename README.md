# Asterisk Voicemail Main Application

Asterisk voicemail main application that allows users to listen to messages left on their mailbox.

# Installation

```bash
$ git clone https://github.com/asterisk/node-voicemail-main.git
$ cd node-voicemail-main
$ npm install -g .
```

or add the following the your package.json file

```JavaScript
"dependencies": {
  "voicemail-main": "asterisk/node-voicemail-main"
}
```

# Usage

Load as a module:

```JavaScript
var voicemailMain = require('voicemail-main');

voicemailMain.create();
```

or run it as an application:

```bash
$ node app.js
```

# Development

After cloning the git repository, run the following to install the module and all dev dependencies:

```bash
$ npm install
$ npm link
```

Then run the following to run jshint and mocha tests:

```bash
$ grunt
```

jshint will enforce a minimal style guide. It is also a good idea to create unit tests when adding new features.

# License

Apache, Version 2.0. Copyright (c) 2014, Digium, Inc. All rights reserved.

