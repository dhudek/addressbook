const sqlite3 = require('sqlite3').verbose();
const DATABASE_FILE = `${__dirname}/secret.db`;

module.exports = async () => {
    return new sqlite3.Database(DATABASE_FILE, (err) => {
        if (err) {
            console.log('Error opening database', {err});
            return;
        }
    });
}