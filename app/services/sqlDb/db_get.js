const DB_connect = require('./connect');
module.exports = async (application, QUERY) => {
    const { log } = application; 
    const db = await DB_connect();
    return new Promise((resolve, reject) => {
        try {
            log.debug(`QUERY: ${QUERY.replace(/\n/g, " ").replace(/\s\s+/g, ' ')}`);
            db.get(QUERY, (error, rows) => {
                db.close();
                if (error) { 
                    log.error(`error during get query`, { QUERY: QUERY.replace(/\n/g, " ").replace(/\s\s+/g, ' '), error })
                    reject({ error: "Internal server error", code: 500, message: error.message })
                }
                resolve(rows);
            })
        } catch (error) {
            db.close();
            reject({ error: "Internal server error", code: 500, message: error.message })
        }
    });
};