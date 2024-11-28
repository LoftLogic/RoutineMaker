const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'routines'
}).promise()

async function getExercise(name) {
    const [exercise] = await pool.query(`SELECT * FROM exercise WHERE name = ?`, [name]);
    if (!exercise) {
        console.log("Exercise not found")
    }
    return exercise;
}

async function getAllExercises() {
    const [exercise] = await pool.query(`SELECT * FROM exercise`);
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
    const [result] = await pool.query(`UPDATE exercise SET bookmarked = true WHERE name = ?`, [name]);
    return result;
}

async function bookmarkRoutine(name) {
    if (!await getRoutine(name)) {
        console.log("Routine not found");
        return undefined;
    }
    const [result] = await pool.query(`UPDATE routine SET bookmarked = true WHERE name = ?`, [name]);
}

async function createExercise(name, difficulty, time_estimate) {
    await pool.query(`INSERT INTO exercise (name, difficulty, time_estimate) VALUES (?, ?, ?)`, [name, difficulty, time_estimate]);
    const newExercise = await getExercise(name);
    return newExercise;
}

async function getRoutine(name) {
    const [routine] = await pool.query(`SELECT * FROM routine WHERE name = ?`, [name]);
    return routine;
}

async function removeExercise(name) {
    const [result] = await pool.query(`DELETE FROM exercise WHERE name = ?`, [name]);
    return result;
}

async function changeExercise(name, attibuteToChange, newValue) {
    if (!await getExercise(name)) {
        return undefined;
    }
    if (attributeToChange === "name") {
        const [oldExercise] = getExercise(name);
        await removeExercise(name);
        const [result] = await createExercise(newValue, oldExercise[difficulty], oldExercise[time_estimate]);
        return result;
    } else {
        const[result] = await pool.query(`UPDATE exercise SET ? = ? WHERE name = ?`, [attibuteToChange, newValue, name]);
        return result;
    }
}

module.exports = { pool, getExercise, getAllExercises, bookmarkExercise, createExercise, removeExercise, getRoutine };