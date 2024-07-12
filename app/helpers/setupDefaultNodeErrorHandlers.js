module.exports = (process, log) => { 
    // setup uncaught error handler
    process.on('uncaughtException', function (error) {
        log.fatal(error, `Uncaught application error => exit`);
        throw error;
    });
    process.on('unhandledRejection', function (error) {
        log.fatal(error, `Unhandeled promise rejection => exit`);
        throw error;
    });
};