const DeviceDetector = require("device-detector-js");
module.exports = (req, res, next) => {
    let { log } = req.app.locals.application;
    const deviceDetector = new DeviceDetector();
    const ip_info = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "f:0.0.0.0, 0.0.0.0";
    const clientIp = ip_info.split(",").shift().replace(/f/g, "").replace(/:/g, "");
    const DEVICE = deviceDetector.parse(req.useragent.source);
    Object.assign(req.app.locals.application, { userInfo: {
        clientIp: clientIp,
        DEVICE
    }});
    req.app.locals.application.log = log.child({ clientIp, DEVICE });
    log.debug(`obtained client info`);
    next();   
}