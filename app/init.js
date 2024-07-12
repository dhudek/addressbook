const initServices = require('./initServices');
const initExpress = require('./initExpress');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config();

const { 
    createLogger, 
    setupDefaultNodeErrorHandlers, 
    setupDefaultSignalTraps, 
    stopServices,
} = require('./helpers');

module.exports = async (rootDir) => {
    try {
        // Prepare environment object
        const serviceEnv = process.env.NODE_ENV && ['production', 'test', 'development'].includes(process.env.NODE_ENV.toLowerCase()) ? process.env.NODE_ENV.toLowerCase() : 'development';
        const packageJson = require(`${rootDir}/package.json`);
        const config = require(`${rootDir}/config/config.json`);
        const fileExist = fs.existsSync(`${rootDir}/config/${serviceEnv}.json`);
        if (fileExist)
            Object.assign(config, require(`${rootDir}/config/${serviceEnv}.json`));

        if (!config.SALT && process.env.SALT) Object.assign(config, {SALT: process.env.SALT});
        if (!config.jwtSalt && process.env.jwtSalt) Object.assign(config, {jwtSalt: process.env.jwtSalt});
        if (process.env.private_key_id) Object.assign(config.fbDb, {private_key_id: process.env.private_key_id});
        if (process.env.private_key) Object.assign(config.fbDb, {private_key: process.env.private_key});
        if (process.env.client_email) Object.assign(config.fbDb, {client_email: process.env.client_email});
        if (process.env.client_id) Object.assign(config.fbDb, {client_id: process.env.client_id});

        assert(config.SALT, "missing SALT parameter in environment");
        assert(config.jwtSalt, "missing jwtSalt parameter in environment");
        assert(config.fbDb.private_key_id, "missing private_key_id parameter in environment");
        assert(config.fbDb.private_key, "missing private_key parameter in environment");
        assert(config.fbDb.client_email, "missing client_email parameter in environment");
        assert(config.fbDb.client_id, "missing client_id parameter in environment");

        // Create main application object
        const application = {
            name: packageJson.name,
            version: packageJson.version,
            env: serviceEnv, 
            config,
            rootDir,
            services: {}
        };

        // create logger
        const log = createLogger(application);
        Object.assign(application, { log });

        // Setup default Node error handlers      
        setupDefaultNodeErrorHandlers(process, log);

        // Init services
        await initServices(application);

        // Init Express
        await initExpress(application);

        // Create app destroy handler
        const destroyServices = () => {
            log.info('Destroy services');
            stopServices(application);
        };

        // Setup trap handlers
        setupDefaultSignalTraps(process, log, exit => {
            log.info('onExit called', exit);
            destroyServices();
            if (exit) process.exit(0);
        });

    } catch (error) {
        throw new Error(`Error during init: ${error.message}`);
    }
}