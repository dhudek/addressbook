
module.exports = async (application) => {
    const { log } = application;

    return {
        stop() {
            log.info('fireBase service END');
        },
        insert: require('./fb_insert')
    };
};