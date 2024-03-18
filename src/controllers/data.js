const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

function load() {
    const dbJSON = fs.readFileSync(dbPath);
    return JSON.parse(dbJSON);
}

function save(db) {
    const dbJSON = JSON.stringify(db);
    fs.writeFileSync(dbPath, dbJSON);
}

module.exports = { load, save };
