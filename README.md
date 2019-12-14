# Acrus

An efficient ExpressJs framework for creating awesome web servers

<div align="center">
	<a href="https://www.npmjs.com/package/acrus"><img src="https://img.shields.io/npm/v/acrus.svg?maxAge=3600" alt="NPM version" /></a>
	<a href="https://www.npmjs.com/package/acrus"><img src="https://img.shields.io/npm/dt/acrus.svg?maxAge=3600" alt="NPM downloads" /></a>
	<a href="https://david-dm.org/GamesProSeif/acrus"><img src="https://img.shields.io/david/GamesProSeif/acrus.svg?maxAge=3600" alt="Dependencies" /></a>
</div>

### Table of Content
1. [Introduction](#introduction)
1. [Getting Started](#getting-started)
1. [Credits](#credits)

### Introduction

This frameworks aims to have web servers built in an object oriented programming (OOP) way, and organise structure of API. Enjoy using [ExpressJs](https://expressjs.com/) like you didn't do before, with all utilities and features this framework provides.

### Getting Started

Download the package using
```bash
$ yarn add acrus
# or
$ npm install acrus
```

You first need to create a server instance, providing valid options.

Inside `index.js`, require `acrus`, extend the `Server` class and provide desired options to `super`.

```js
const { Server } = require('acrus');

class MyServer extends Server {
	constructor() {
		super({
			port: 5000,
			baseEndpoint: '/app'
		});

		// ... extending the class
	}
}
```

Secondly, you need to create a `RouteHandler` instance, providing the valid options, and adding it as a property in `MyServer#routeHandler`.

> Constructor of `RouteHandler` expects a `Server` instance as first parameter, and `RouteHandlerOptions` as second one. 

After creating a `RouteHandler` instance, you need to load all routes, and initialise it. Simply call `RouteHandler#loadAll` and `RouteHandler#init`. We can do this in a separate method `MyServer#_init`.

For organising purposes. Define another method `MyServer#start` that will call the initialise function and listen to the port provided in the options.

```js
const { RouteHandler, Server } = require('acrus');
const { join } = require('path');

class MyServer extends Server {
	constructor() {
		super({
			port: 5000,
			baseEndpoint: '/app'
		});

		this.routeHandler = new RouteHandler(this, {
			directory: join(__dirname, 'routes/')
		});
	}

	_init() {
		this.routeHandler.loadAll();
		this.routeHandler.init();
	}

	start() {
		this._init();
		this.listen();
	}
}
```

You can then create an instance of your custom server (`MyServer`), and start it. You can use the event `ready` to know when the server has started.

```js
const server = new MyServer();

server.on('ready', () => {
	console.log(`Server started on port ${server.port}`);
	console.log(`Modules loaded: ${server.routeHandler.modules.size}`);
});

server.start();
```

Next step is creating routes. Create a folder, called "routes", and create your first route inside it, "TestGET", for example. You need to extend the class `Route` and export it.

```js
const { Route } = require('acrus');

class TestGET extends Route {
	constructor() {
		super('test', {
			endpoint: '/test',
			type: 'GET'
		});
	}

	exec(req, res) {
		res.json({ msg: 'hello world' });
	}
}

module.exports = TestGET;
```

Now run the code, and hit the endpoint you just created, considering the `baseEndpoint` provided and the endpoint in the route, the URL should be `localhost:5000/app/test`.

Congratulations, you now have your first web server using Acrus up and running.

### Credits

This package is authored and maintained with <3 by [GamesProSeif](https://github.com/GamesProSeif)
