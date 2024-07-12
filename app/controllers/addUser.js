const assert = require('assert');

const { 
    scrambler,
} = require('../helpers');

module.exports = async (req, res, next) => {
    const { application } = req.app.locals;
    const { log, services, config } = application;
    const { sqlDb, jwt } = services;

    try {
        const { 
            email, 
            password
        } = req.body;

        assert(email, 'Missing param email');
        assert(password, 'Missing param email');

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
                    log.info('User not found');
                } else {
                    next({code: 401, message: "invalid credentials"});   
                }
            }, (error) => {
                log.error('Error during checkDbForUser', error);
                next({code: 500, message: "invalid credentials"});
            });
    
        const token = await jwt.encode(application, { email: email }); 
       
        sqlDb.insert(application, { 
            email: email,
            password: scrambler(config, password),
            accessToken: token
        })
            .then((response) => { 
                res.cookie('accessToken', token, { maxAge: 1000 * 60 * config.cookieExpiry, httpOnly: true });
                res.status(200).json({message: "User registered"});
            }, (error) => { 
                log.error('error during user creation', { message: error.message })
                next({code: 500, message: "Internal server error"});
            });

    } catch (error) {
        log.error('caught Error during user creation', {message: error.message});
        next({code: 500, message: 'Internal server error'});
    }
};