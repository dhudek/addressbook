const DB_connect = require('./connect');
module.exports = async (application, QUERY, WHERE) => {
    const { log } = application;
    const db = await DB_connect();
    const SET = [];
    for (let i=0; i<Object.keys(QUERY).length; i++) {
        SET.push(`${Object.keys(QUERY)[i]} = "${Object.values(QUERY)[i]}"`);
    };
    return new Promise((resolve, reject) => {
        try {
            log.debug(`QUERY:`, QUERY);
            db.run(`UPDATE users SET ${SET.join(", ")} WHERE ${WHERE}`, (error) => {
                db.close();
                if (error) {
                    log.debug(`error during update query`, { QUERY, message: error.message })
                    reject({ error: "Internal server error", code: 500 })
                }
                resolve();
            })
        } catch (error) {
            log.error('error during user update', {message: error.message})
            db.close();
            reject({ error: "Internal server error", code: 500 })
        }
    });
};