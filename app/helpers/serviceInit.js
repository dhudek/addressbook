module.exports = async (serviceName, serviceCreatorFunction, application) => {
    const { log, services, config } = application;
    if (services[serviceName]) 
        throw new Error(`Service with name ${serviceName} is already registered`);
    const servicesConfig = config.services || {};
    const serviceConfig = servicesConfig[serviceName] || {};
    if (serviceConfig.disabled === true) {
        log.info(`Service ${serviceName} is disabled => not starting`);
    } else {
        try {
            log.info(`Start service ${serviceName}`);
            const serviceLog = log.child({ service: serviceName });
            const serviceInit = await serviceCreatorFunction(
                Object.assign({}, application, { log: serviceLog, serviceConfig }),
                { serviceConfigKey: serviceName }
            );
            if (!serviceInit) throw new Error('Result of service creation is null or undefined');
            services[serviceName] = serviceInit;
            return serviceInit;
        } catch (error) {
            log.error(`serviceInit error`, error);
            return; 
        }
    };
};