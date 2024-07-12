
module.exports = async (req, res, next) => {
    const { application } = req.app.locals;
    const { log, services } = application;
    const { jwt } = services;
    const { accessToken } = req.cookies;
    if (accessToken) {
        await jwt.decode(application, accessToken)
            .then(response => { 
                log.info('Token decoded', {response});
                next({ code:401, message: "you are already logged in" });
            }, error => { 
                next({ code:401, message: "invalid access token" });
            });
    } else {
        next()
    }
};