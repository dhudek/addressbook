const jwt = require('jsonwebtoken');

module.exports = async function(application, token) {
    const { log, config } = application; 
    return new Promise((resolve, reject) => {
        try {
            const tokenContent = jwt.verify(token, config.jwtSalt);
            resolve(tokenContent);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                reject({ error: "Invalid token", code: 401, message: error.message });
            } else if (error instanceof jwt.TokenExpiredError) {
                reject({ error: "The jwt has expired", code: 401, message: error.message });
            } else {
                reject({ error: "The jwt encountered an error", code: 401, message: error.message });
            }
        }
    })  
};