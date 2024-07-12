const jwt = require('jsonwebtoken');

module.exports = async function(application, tokenData) {
    const { log, config } = application;

    const token = jwt.sign(tokenData, config.jwtSalt, {
        expiresIn: config.jwtExpiresIn,
    });

    return token;
};