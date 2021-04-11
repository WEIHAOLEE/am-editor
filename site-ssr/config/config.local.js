'use strict';

module.exports = appInfo => {
	const config = (exports = {});
	config.domain = 'http://localhost:7001';
	config.logger = {
		level: 'NONE',
		consoleLevel: 'DEBUG',
	};
	config.assets = {
		devServer: {
			debug: true,
			autoPort: true,
		},
		dynamicLocalIP: false,
	};
	return config;
};
