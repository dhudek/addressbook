const crypto = require('crypto');
module.exports = (config, input) => {
    const hashedCredentials = crypto
        .createHash('sha256')
        .update(input + config.SALT)
        .digest('hex');
    return hashedCredentials;
};