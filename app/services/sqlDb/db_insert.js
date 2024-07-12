const DB_connect = require('./connect');
module.exports = async function (application, QUERY) {
    const { log } = application;
    const db = await DB_connect();
    const columns = Object.keys(QUERY).join(", ");
    const placeHolders = Object.keys(QUERY).fill("?").join(",");
    return new Promise((resolve, reject) => {
        try {
            log.debug(`QUERY:`, QUERY);
            db.run('INSERT INTO users (' + columns + ') VALUES (' + placeHolders + ')', Object.values(QUERY), (error) => {
                db.close();
                if (error) {
                    log.debug(`error during get query`, { QUERY, message: error.message })
                    reject({ error: "Internal server error", code: 500, message: error.message })
                };
                resolve({ message: "success" });
            });
        } catch (error) {
            db.close();
            reject({ error: "Internal server error", code: 500, message: error.message })
        }
    });
};