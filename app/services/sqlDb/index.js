const { scrambler } = require(`../../helpers`);
const fs = require('fs');

module.exports = async (application) => {  
    const { log } = application;
    const createTable = require(`./db_createTable`);
    const dbInsert = require(`./db_insert`);

    const createDbTables = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            disabled BOOLEAN NOT NULL DEFAULT 0,
            password TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accessToken TEXT,
            UNIQUE("id", email),
            PRIMARY KEY("id" AUTOINCREMENT)
        )
    `;

    const fileExist = fs.existsSync(`${__dirname}/secret.db`);
    if (!fileExist) {
        await createTable(application, createDbTables)
            .then(() => {
                log.info('running table check');
            })
            .catch(error => {
                log.error('Error creating table', error)
            }); 
        await dbInsert(application, {
            email: `test@gmail.com`, 
            password: `${scrambler(application.config, "1234")}`, 
        })
            .then(() => {
                log.info('running dbInsert check');
            })
            .catch(error => {
                log.error('Error creating dummy account', error)
            }); 
    };

    return {
        stop() {
            log.info('sqlDb service END');
        },
        get: require('./db_get'),
        insert: require('./db_insert'),
        update: require(`./db_update`)
    }
};