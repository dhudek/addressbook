const bunyan = require('bunyan');

const gatherNonObjectArgs = (...args) => {
    const stringArgs = args.filter((arg) => !isObject(arg));
    return stringArgs.join(' ');
};

const gatherObjectArgs = (...args) => {
    const objArgs = args.filter((arg) => isObject(arg));
    const result = Object.assign({}, ...objArgs);
    return !isEmptyObject(result) && result;
};

const isObject = (val) => {
    if (val === null) return false;
    return ((typeof val === 'function') || (typeof val === 'object'));
};

const isString = (val) => {
    return (typeof val === 'string') || (val instanceof String);
};

const isEmptyObject = (val) => Object.keys(val).length === 0;

const wrapBunyanFunction = (bunyanFunc) => {

    return (...allArgs) => {
        const [firstArg, secondArg, ...rest] = allArgs;
        if (isString(firstArg)) {
            // collect all non string params and log them as msgData
            const msgData = gatherObjectArgs(secondArg, ...rest);
            if (msgData && msgData?.QUERY?.password)
                delete msgData?.QUERY?.password;
            if (msgData && msgData?.QUERY?.accessToken)
                delete msgData?.QUERY?.accessToken;
            if (msgData && msgData?.password)
                delete msgData?.password;
            if (msgData && msgData?.accessToken)
                delete msgData?.accessToken;
            return bunyanFunc(isEmptyObject(msgData) ? {} : {msgData}, gatherNonObjectArgs(...allArgs));
        } else if (isObject(firstArg)) {
            let dataToLog = Object.assign({}, firstArg);
            // create data object from the rest of the params
            const msgData = gatherObjectArgs(...rest);
            if (!isEmptyObject(msgData)) {
                // if we have some msgData, add them to the first argument
                // ensure the msgData key is not taken
                dataToLog = Object.assign({},dataToLog, {msgData});
            }
            return bunyanFunc(dataToLog, gatherNonObjectArgs(...allArgs));
        } else {
            return bunyanFunc(...allArgs);
        }
    };
};

const wrapBunyanLogger = (bunyanLogger) => {
    return {
        trace: wrapBunyanFunction(bunyanLogger.trace.bind(bunyanLogger)),
        debug: wrapBunyanFunction(bunyanLogger.debug.bind(bunyanLogger)),
        info: wrapBunyanFunction(bunyanLogger.info.bind(bunyanLogger)),
        warn: wrapBunyanFunction(bunyanLogger.warn.bind(bunyanLogger)),
        error: wrapBunyanFunction(bunyanLogger.error.bind(bunyanLogger)),
        fatal: wrapBunyanFunction(bunyanLogger.fatal.bind(bunyanLogger)),
        child(options) {
            const newChildLogger = bunyanLogger.child(options);
            return wrapBunyanLogger(newChildLogger);
        },
    };
};
  
const errorSerializer = error => {
    const result = bunyan.stdSerializers.err(error);
    result.uniqueId = error.uniqueId;
    result.previousErrorUniqueId = error.previousErrorUniqueId;
    return result;
};

module.exports = (application) => {
    const {
        name, 
        version, 
        env,
        config
    } = application;

    const logLevel = env === 'development' && 'debug' || 'info';

    let log = bunyan.createLogger({
        name: name,
        streams: [
        {
            level: logLevel,
            stream: process.stdout,
        },
        ],
        serializers: {err: errorSerializer},
    });
    
    log = log.child({ 
        appVersion: version,
        appName: name,
        hostname: config?.HOSTNAME || require('os').hostname()
    });
    
    return wrapBunyanLogger(log);
};