const assert = require('assert');

module.exports = async (req,res,next) => {
    const { application } = req.app.locals;
    const { log, config, services } = application;
    const { jwt, sqlDb } = services;
    const { accessToken } = req.cookies;
    if (accessToken) { 
        let credentials;
        try {
            const sqlQuery = `
                SELECT id, email, password, accessToken
                FROM users
                WHERE accessToken = "${accessToken}";
            `;
            await sqlDb.get(application, sqlQuery)
                .then((result) => { 
                    assert(result, 'No user found with this access token');
                    credentials = result;
                    Object.assign(req.app.locals.application, { credentials: result });
                }, (error) => {
                    log.error('Error during checkDbForUser', error);
                    next({code: 500, message: "Internal server error"});
                });

            await jwt.decode(application, accessToken)
                .then(async token => { 
                    assert(token.email, 'Missing email in token');
                    assert(credentials, 'Missing credentials'); 
                    if (token.email != credentials.email) 
                        next({ code:401, message: "Invalid access token" });

                    let startDate = new Date(0);
                    startDate.setUTCSeconds(token.exp);
                    const endDate = new Date();
                    const seconds = ((startDate.getTime() - endDate.getTime()) / 1000).toFixed();
                    if ((60 * 10) > seconds) {
                        const newToken = await jwt.encode(application, { email: token.email }); 
                        sqlDb.update(application, { accessToken: newToken }, `id = ${credentials.id}`)
                            .then((response) => {
                                res.cookie('accessToken', newToken, { maxAge: 1000 * 60 * config.cookieExpiry, httpOnly: true }); 
                                next();
                            }, error => { 
                                log.error('error during access token creation', {error})
                                next({code:500, message: "Internal server error" })
                            })
                    } else { 
                        next();
                    }
                }, error => {
                    log.error('error during token decoding', {error})
                    next({ code:500, message: "invalid access token" });
                });
            } catch (error) { 
                log.error(`error during checkAccessToken`, {message: error.message});
                next({code: 400, message: error.message});
            }
    } else {
        next({ code:401, message: "You are not logged in, please login again" });
    }
};