const { 
    obtainClientInfo, // get some basic info about the client ip device browser etc
    checkRegUserAuth, // check if cookie exists and is valid for registration
    checkUserCredentials, // check if user credentials are valid
    checkAccessToken // check access token for non registration/login api's, renews cookie too
} = require('../middlewares');

const { 
    addUser, // add user to the db
    loginUser, // login user
    addNewContact // add new contact
} = require('../controllers');

module.exports = (expressApp) => {
    expressApp.get('/status', 
        (req,res) => {
            const { application } = req.app.locals;
            const  { name, version} = application;
            res.status(200).json({
                appName: name, 
                appVersion: version, 
                status: "ok", 
                timestamp: new Date().toISOString()
            });
        }
    );
    expressApp.post('/registration',
        obtainClientInfo, 
        checkRegUserAuth,
        addUser
    );
    expressApp.post('/login', 
        obtainClientInfo,
        checkRegUserAuth, 
        checkUserCredentials,
        loginUser
    );
    expressApp.post('/new-contact', 
        obtainClientInfo,
        checkAccessToken,
        addNewContact
    );
};