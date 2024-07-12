const assert = require('assert');
const jwt = require('jsonwebtoken');
module.exports = async function(application) {
    const { log } = application;

    log.info('JWT service START');

    return {
        stop() {
            log.info('JWT service END');
        },
        encode: require('./encode'),
        decode: require('./decode'),
    };
};