const { 
    serviceInit
} = require('./helpers');

module.exports = (application) => {
    serviceInit('jwt', require('./services/jwt'), application);
    serviceInit('sqlDb', require('./services/sqlDb'), application);
    serviceInit('fbDb', require('./services/fireBase'), application);
};