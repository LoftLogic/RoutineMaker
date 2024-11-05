const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'routines'
}).promise()

async function getExercise(name) {
    const [exercise] = await pool.query(`SELECT * FROM exercise WHERE name = ?`, [name])
    if (!exercise) {
        console.log("Exercise not found")
    }
    return exercise;
}

async function bookmarkExercise(name) {
    if (!await getExercise(name)) {
        console.log("Exercise not found")
        return undefined;
    }
    const[result] = await pool.query(`UPDATE exercise SET bookmarked = true WHERE name = ?`, [name]);
    return result;
}


module.exports = { pool, getExercise, bookmarkExercise };