const assert = require('assert');
const { 
    scrambler,
} = require('../helpers');
module.exports = (req, res, next) => {
    const { application } = req.app.locals;
    const { config, log, services } = application;
    const { sqlDb } = services;
    try {

        const { 
            email, 
            password 
        } = req.body;

        assert(email, 'Missing param email');
        assert(password, 'Missing param password'); 

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
        const isValid = emailPattern.test(email);
    
        if (!isValid)
            next({code: 400, message: "Invalid email"});
    
        const sqlQuery = `
            SELECT id, email, password, accessToken
            FROM users
            WHERE email = "${email}";
        `;

        sqlDb.get(application, sqlQuery)
            .then((result) => { 
                if (!result) { 
                    log.info('User not found', {email});
                    next({code: 401, message: "invalid credentials"});
                } else {
                    const { email: cEmail, password: cPassword, accessToken } = result;

                    if (cEmail == email && cPassword == scrambler(config, password)) {  
                        Object.assign(req.app.locals.application, { credentials: result });
                        next()
                    } else { 
                        log.warn('Invalid credentials', {email});
                        next({code: 401, message: "Invalid credentials"});
                    }
                }
            }, (error) => {
                log.error('Error during checkDbForUser', {message: error.message});
                next({code: 401, message: "invalid credentials"});
            });
    } catch(error) {
        log.error('Error during checkUserCredentials', {message: error.message});
        next({ code: 401, message: error.message });
    }
};