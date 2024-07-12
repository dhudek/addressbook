module.exports = async (req, res, next) => {  
    const { application } = req.app.locals;
    const { log, services, config, credentials } = application;
    const { fbDb } = services;

    const { 
        firstName, 
        lastName,
        address,
        phoneNumber
    } = req.body;

    try {
        const insertObj = { 
            firstName: firstName || null, 
            lastName: lastName || null, 
            address: address || null, 
            phoneNumber: phoneNumber || null, 
            uid: credentials.id
        };
        const fireBaseInsert = await fbDb.insert(application, insertObj);
        log.info('contact created', {fireBaseInsert});
        res.status(200).json({message: "successfully added new contact"});
    } catch (error) {
        log.error('error during contact creation', {message: error.message})
        next({code: 500, message: "Internal server error"});
    }
};