module.exports = (process, log, destroyCallback) => {
    const onExit = destroyCallback || (() => {
        log.warn('Signal traps have empty callback');
    });
    process.on('SIGTERM', onExit.bind(null, true));
    process.on('SIGINT', onExit.bind(null, true));
    process.on('exit', onExit.bind(null, false));
};