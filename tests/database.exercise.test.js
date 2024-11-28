const { get } = require('../app.js');
const { pool, getExercise, bookmarkExercise, removeExercise, getAllExercises, createExercise,
    changeExercise, getRoutine, createRoutine, bookmarkRoutine, removeRoutine, updateRoutine,
    addExerciseMuscleFocus } = require('../database.js');
const mysql = require('mysql2');

beforeAll(async () => {
    await pool.query(
        `INSERT INTO exercise (name, difficulty, time_estimate) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), difficulty = VALUES(difficulty), 
        time_estimate = VALUES(time_estimate)`,
        ['Test1', 3, 3]
    );
    await pool.query(`INSERT INTO routine (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)` ,['Routine1']);
});

afterAll(async () => {
    await pool.query(`DELETE FROM exercise WHERE name = ?`, ['Test1']);
    await pool.query(`DELETE FROM routine WHERE name = ?`, ['Push']);
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

describe('Test adding exercise', () => {
    it('adding new exercise', async () => {
        await createExercise("Sample", 5, 4);
        const [result] = await getExercise("Sample");
        expect(result).toEqual({
            name: 'Sample',
            difficulty: 5,
            time_estimate: 4,
            bookmarked: 0
        });
        await pool.query(`DELETE FROM exercise WHERE name = ?`, ['Sample']);
    })
})

describe('Test bookmark Exercise', () => {
    it('bookmark exercise should set bookmarked to true', async () => {
        await createExercise("Sample", 1, 1);
        const [before] = await getExercise("Sample");
        console.log(before)
        expect(before['bookmarked']).toBeFalsy();
        await bookmarkExercise("Sample");
        const [after] = await getExercise("Sample");
        expect(after['bookmarked']).toBeTruthy();
        await removeExercise("Sample");
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

describe('Test editing exercise', () => {
    it('Test editing difficulty', async() => {
        await createExercise("Sample", 1, 1);
        const [before] = await getExercise("Sample");
        expect(before['difficulty']).toEqual(1);
        await changeExercise("Sample", "difficulty", 2);
        const [after] = await getExercise("Sample");
        expect(after['difficulty']).toEqual(2);
        await removeExercise("Sample");
    })
    it('Test editing time estimate', async() => {
        await createExercise("Sample", 1, 1);
        const [before] = await getExercise("Sample");
        expect(before['time_estimate']).toEqual(1);
        await changeExercise("Sample", "time_estimate", 3);
        const [after] = await getExercise("Sample");
        expect(after['time_estimate']).toEqual(3);
        await removeExercise("Sample");
    })
    it('Test editing name', async() => {
        await removeExercise("New_Sample");
        await createExercise("Sample", 1, 1);
        const [before] = await getExercise("Sample");
        expect(before['name']).toEqual('Sample');
        await changeExercise("Sample", "name", "New_Sample");
        const [after] = await getExercise("New_Sample");
        expect(after['name']).toEqual('New_Sample');
        await removeExercise("New_Sample");
    })
})

describe('Test get routine', () => {
    it('Test getting routine', async() => {
        const [routine] = await getRoutine("Routine1");
        expect(routine).toEqual({
            name: "Routine1",
            est_duration: 0,
            overall_intensity: 0,
            bookmarked: 0
        });
    })
    it('getRoutineshould return undefined with a nonexistent name', async () => {
        const [result] = await getRoutine("DNE");
        expect(result).toBeUndefined();
    })
})

describe('Test creating routine', () => {
    it('Test creating a routine', async() => {
        await createRoutine("Batman_Routine");
        const [routine] = await getRoutine("Batman_Routine");
        expect(routine).toEqual({
            name: "Batman_Routine",
            est_duration: 0,
            overall_intensity: 0,
            bookmarked: 0
        });
        await pool.query(`DELETE FROM routine WHERE name = ?`, ['Batman_Routine']);
    })
})


describe('Test bookmark Routine', () => {
    it('bookmark routine should set bookmarked to true', async () => {
        await createRoutine("Sample");
        const [before] = await getRoutine("Sample");
        expect(before['bookmarked']).toBeFalsy();
        await bookmarkRoutine("Sample");
        const [after] = await getRoutine("Sample");
        expect(after['bookmarked']).toBeTruthy();
        await pool.query(`DELETE FROM routine WHERE name = ?`, ['Sample']);
    })
})

describe('Test removing routines', () => {
    it("Should remove routine", async() => {
        await createRoutine("Sample");
        const [before] = await getRoutine("Sample");
        expect(before).toEqual({
            name: "Sample",
            est_duration: 0,
            overall_intensity: 0,
            bookmarked: 0
        });
        await removeRoutine("Sample");
        const [after] = await getRoutine("Sample");
        expect(after).toBeUndefined();
    })
})

describe('Test removing routines', () => {
    it("Should remove routine", async() => {
        await createRoutine("Sample");
        const [before] = await getRoutine("Sample");
        expect(before).toEqual({
            name: "Sample",
            est_duration: 0,
            overall_intensity: 0,
            bookmarked: 0
        });
        await removeRoutine("Sample");
        const [after] = await getRoutine("Sample");
        expect(after).toBeUndefined();
    })
})

describe('Update routine renames a routine', () => {
    it("Rename routine", async() => {
        await createRoutine("Sample");
        await updateRoutine("Sample", "NEWNAME");
        const [routine] = await getRoutine("NEWNAME");
        expect(routine['name']).toEqual("NEWNAME");
        await removeRoutine("Sample");
    })
});

describe('Add exercise muscle', () => {
    it("", async() => {
        //ENDED HERE!
    })
});
