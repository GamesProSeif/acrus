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

```js
const { Server } = require('acrus');
const express = require('express');
const { join } = require('path');

const server = new Server({
	port: 5000,
	routesDirectory: join(__dirname, 'api/'),
	baseEndpoint: '/app',
	app: express()
});

server.init();

server.on('ready', () => {
	console.log(`server started on port ${server.port}`);
	console.log(`routes loaded ${server.routeHandler.modules.size}`);
});
```

Secondly, you need to create routes. Create a folder, called "api", and create your first route inside it, "TestGET", for example. You need to extend the class `Route` and export it.

```js
const { Route } = require('acrus');

class TestGET extends Route {
	constructor() {
		super('test', {
			endpoint: 'test',
			type: 'GET'
		});
	}

	exec(req, res) {
		res.json({ msg: 'hello world' });
	}
}

module.exports = TestGET;
```

Now run the code, and hit the endpoint you just created, considering the baseEndpoint provided and the endpoint in the route, the URL should be `localhost:5000/app/test`.

Congratulations, you now have your first web server using Acrus up and running.

### Credits

This package is authored and maintained with <3 by [GamesProSeif](https://github.com/GamesProSeif)
