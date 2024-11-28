const { pool, getExercise, bookmarkExercise, removeExercise, getAllExercises } = require('../database.js');
const mysql = require('mysql2');

beforeAll(async () => {
    await pool.query(
        `INSERT INTO exercise (name, difficulty, time_estimate) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), difficulty = VALUES(difficulty), 
        time_estimate = VALUES(time_estimate)`,
        ['Test1', 3, 3]
    );
});

afterAll(async () => {
    await pool.query(`DELETE FROM exercise WHERE name = ?`, ['Test1']);
    await pool.end();
});

describe('Test getExercise', () => {
    it('getExercise should retrieve the correct exercise data', async () => {
        const [result] = await getExercise("Test1");
        expect(result).toEqual({
            name: 'Test1',
            difficulty: 3,
            time_estimate: 3,
            bookmarked: 0
        });
    });
    it('getExercise should return undefined with a nonexistent name', async () => {
        const result = await getExercise("DNE");
        expect(result[0]).toBeUndefined();
    })
});

describe('Test bookmark Exercise', () => {
    it('bookmark exercise should set bookmarked to true', async () => {
        const [before] = await getExercise("Test1");
        expect(before['bookmarked']).toBeFalsy();
        await bookmarkExercise("Test1");
        const [after] = await getExercise("Test1");
        expect(after['bookmarked']).toBeTruthy();
    })
})

describe('Test deleting Exercises', () => {
    it('Test remvoing Test1', async () => {
        await removeExercise("Test1");
        const [exercise] = await getExercise("Test1");
        expect(exercise).toBeUndefined();
    })
    it('Test removing nothing', async () => {
        before = await getAllExercises();
        await removeExercise("DOESNT EXIST");
        after = await getAllExercises();
        expect(before).toEqual(after);
    })
})