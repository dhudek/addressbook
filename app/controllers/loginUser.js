module.exports = async (req, res, next) => {  
    const { application } = req.app.locals;
    const { log, services, config, credentials } = application;
    const { sqlDb, jwt } = services;
    const { email } = req.body;
    try {            

        const token = await jwt.encode(application, { email: email }); 

        sqlDb.update(application, { accessToken: token }, `id=${credentials.id}`)
            .then((result) => { 
                res.cookie('accessToken', token, { maxAge: 1000 * 60 * config.cookieExpiry, httpOnly: true });
                res.status(200).json({message: "successfully logged in"});
            }, (error) => {
                log.error('Error during checkDbForUser', error);
                next({code: 500, message: "Internal server error"});
            });
       

    } catch (error) {
        next({code: 500, message: "internal server error"});
    }
};