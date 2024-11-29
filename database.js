const mysql = require('mysql2');

const MUSCLEGROUPS = {
    "Chest": ["Mid Chest", "Upper Chest", "Lower Chest"], 
    "Shoulder": ["Front Delt", "Side Delt", "Rear Delt"],
    "Tricep": ["Tricep Long Head", "Tricep Lateral Head"],
    "Bicep": ["Bicep Long Head", "Bicep Short Head"],
    "Back": ["Upper Back", "Lats", "Traps"],
    "Legs": ["Quads", "Hamstrings", "Glutes", "Calves"]
};

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

async function createExercise(name, difficulty, time_estimate) {
    const [exercise] = await getExercise(name);
    if (exercise) {
        return;
    }
    await pool.query(`INSERT INTO exercise (name, difficulty, time_estimate) VALUES (?, ?, ?)`, [name, difficulty, time_estimate]);
    const newExercise = await getExercise(name);
    return newExercise;
}


async function removeExercise(name) {
    const [result] = await pool.query(`DELETE FROM exercise WHERE name = ?`, [name]);
    return result;
}

async function changeExercise(name, attributeToChange, newValue) {
    if (!["name", "difficulty", "time_estimate"].includes(attributeToChange)) {
        console.log("Insert a proper name");
        return undefined;
    }
    if (!await getExercise(name)) {
        console.log("Exercise not found")
        return undefined;
    }
    if (attributeToChange === "name") {
        const [oldExercise] = await getExercise(name);
        await removeExercise(name);
        const [result] = await createExercise(newValue, oldExercise['difficulty'], oldExercise['time_estimate']);
        return result;
    } else {
        const query = `UPDATE exercise SET ${pool.escapeId(attributeToChange)} = ? WHERE name = ?`;
        const [result] = await pool.query(query, [newValue, name]);
        return result;
    }
}


async function bookmarkExercise(name) {
    if (!await getExercise(name)) {
        console.log("Exercise not found")
        return undefined;
    }
    const [result] = await pool.query(`UPDATE exercise SET bookmarked = true WHERE name = ?`, [name]);
    return result;
}

async function unbookmarkExercise(name) {
    if (!await getExercise(name)) {
        console.log("Exercise not found")
        return undefined;
    }
    const [result] = await pool.query(`UPDATE exercise SET bookmarked = false WHERE name = ?`, [name]);
    return result;
}

async function getRoutine(name) {
    const [routine] = await pool.query(`SELECT * FROM routine WHERE name = ?`, [name]);
    return routine;
}

async function createRoutine(name) {
    const [exercise] = await getExercise(name);
    if (exercise) {
        return;
    }
    await pool.query(`INSERT INTO routine (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,[name]);
}

async function bookmarkRoutine(name) {
    if (!await getRoutine(name)) {
        console.log("Routine not found");
        return undefined;
    }
    const [result] = await pool.query(`UPDATE routine SET bookmarked = true WHERE name = ?`, [name]);
}

async function unbookmarkRoutine(name) {
    if (!await getRoutine(name)) {
        console.log("Routine not found");
        return undefined;
    }
    const [result] = await pool.query(`UPDATE routine SET bookmarked = false WHERE name = ?`, [name]);
}

async function removeRoutine(name) {
    const [result] = await pool.query(`DELETE FROM routine WHERE name = ?`, [name]);
    return result;
}

async function updateRoutine(name, newName) {
    await removeRoutine(name);
    const result = await createRoutine(newName);
    return result;
}

async function getExerciseMuscleFocus(exercise, muscle) {
    const [result] = await pool.query(`SELECT * FROM exercise_muscle WHERE exercise_name = ? AND muscle_name = ?`, 
        [exercise, muscle]);
    return result;
}


async function createExerciseMuscleFocus(exercise, muscle, focus) {
    const result = await pool.query(`INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) 
    VALUES (?, ?, ?)`, [exercise, muscle, focus]);
    return result;
}

async function removeExerciseMuscleFocus(exercise, muscle) {
    return await pool.query(`DELETE FROM exercise_muscle WHERE exercise_name = ? AND muscle_name = ?`,
        [exercise, muscle]);
}

async function changeFocusLevel(exercise, muscle, newFocus) {
    return await pool.query(`UPDATE exercise_muscle SET focus = ? WHERE exercise_name = ? AND muscle_name = ?`, 
        [newFocus, exercise, muscle]);
}

async function createExerciseRoutine(routine, exercise, numSets) {
    const [result] = await pool.query(`INSERT INTO routine_exercise(routine_name, exercise_name, num_sets) VALUES (?, ?, ?)`,
        [routine, exercise, numSets]);
    return result;
}

async function getExerciseRoutine(routine, exercise) {
    const [result] = await pool.query(`SELECT * FROM routine_exercise WHERE routine_name = ? AND exercise_name = ?`,
    [routine, exercise]);
    return result;
}

async function removeExerciseRoutine(routine, exercise) {
    const [result] = await pool.query(`DELETE FROM routine_exercise WHERE routine_name = ? AND exercise_name = ?`,
    [routine, exercise]);
    return result;
}

async function changeNumSets(routine, exercise, numSets) {
    const [result] = await pool.query(`UPDATE routine_exercise SET num_sets = ? WHERE routine_name = ? AND exercise_name = ?`,
    [numSets, routine, exercise]);
    return result;
}

async function createEquipmentExercise(equipment, exercise) {
    const [result] = await pool.query(`INSERT INTO equipment_exercise(equipment_name, exercise_name) VALUES (?, ?)`,
    [equipment, exercise]);
    return result;
}

async function getEquipmentExercise(equipment, exercise) {
    const [result] = await pool.query(`SELECT * FROM equipment_exercise WHERE equipment_name = ? AND exercise_name = ?`,
    [equipment, exercise]);
    return result;
}

async function removeEquipmentExercise(equipment, exercise) {
    const [result] = await pool.query(`DELETE FROM equipment_exercise WHERE equipment_name = ? AND exercise_name = ?`,
    [equipment, exercise]);
    return result;
}




module.exports = { pool, getExercise, getAllExercises, bookmarkExercise, createExercise, removeExercise, 
    changeExercise, getRoutine, createRoutine, bookmarkRoutine, removeRoutine, updateRoutine, 
    getExerciseMuscleFocus, createExerciseMuscleFocus, removeExerciseMuscleFocus, changeFocusLevel,
    createExerciseRoutine, getExerciseRoutine, removeExerciseRoutine, changeNumSets,
    createEquipmentExercise, getEquipmentExercise, removeEquipmentExercise };