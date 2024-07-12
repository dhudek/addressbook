module.exports = (application) => {
    const { log } = application;
    if (!process.stdout.destroyed) {
        log.info('Stop services');
        log.info('Services', Object.keys(application.services));
    };
    for (const serviceKey of Object.keys(application.services)) {
        const service = application.services[serviceKey];
        // call stop function only if this service supports it
        if (service && service.stop) {
            if (!process.stdout.destroyed) 
                log.info('Stopping service ' + serviceKey, { serviceKey });
            service.stop();
        }
    };
};