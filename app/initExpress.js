const useragent = require('express-useragent');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const initRoutes = require('./routers/');

module.exports = (application) => {
    const { log, config, env } = application;
    const expressApp = express();

    Object.assign(expressApp.locals, { application });

    expressApp.set('x-powered-by', false);
    
    expressApp.use(helmet({
        hsts: false, 
        frameguard: false
    }));

    expressApp.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST'],
    }));

    expressApp.use(express.json());
    expressApp.use(bodyParser.json({limit: '200mb'}));
    expressApp.use(useragent.express());
    expressApp.use(cookieParser());
  
    /** Enable gzip compression */
    expressApp.use(compression());

    // setup routes
    initRoutes(expressApp);

    // error handling
    expressApp.use((err, req, res, next) => {
        res.status(err?.code || 500).json({ error: err.message || "Internal server error" });
    });

    expressApp.use((req, res, next) => {
        res.status(404).json({ message: "oopsy not found, keyboard cat" });
    });

    // start express application
    const port = config?.port ? config.port : 3000;
    const hostname = config?.HOSTNAME || require('os').hostname();
    expressApp.listen(port, () => {
        log.info(`Application listening on hostname: ${hostname} and port: ${port}`);
    }); 
}