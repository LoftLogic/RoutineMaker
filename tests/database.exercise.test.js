const { get } = require('../app.js');
const { pool, getExercise, bookmarkExercise, removeExercise, getAllExercises, createExercise,
    changeExercise, getRoutine, createRoutine, bookmarkRoutine, removeRoutine, updateRoutine,
    getExerciseMuscleFocus, createExerciseMuscleFocus, removeExerciseMuscleFocus, changeFocusLevel,
    createExerciseRoutine, getExerciseRoutine, removeExerciseRoutine, changeNumSets,
    createEquipmentExercise, removeEquipmentExercise, getEquipmentExercise } = require('../database.js');
const mysql = require('mysql2');

beforeAll(async () => {
    await pool.query(
        `INSERT INTO exercise (name, difficulty, time_estimate) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), difficulty = VALUES(difficulty), 
        time_estimate = VALUES(time_estimate)`,
        ['Test1', 3, 3]
    );
    await pool.query(`INSERT INTO routine (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)`, ['Routine1']);
    await pool.query(`INSERT INTO exercise_muscle (exercise_name, muscle_name, focus) 
        VALUES (?, ?, 0.15)`, ['Bicep Curl', 'Bicep Long Head']);
    await removeExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
});

afterAll(async () => {
    await pool.query(`DELETE FROM exercise WHERE name = ?`, ['Test1']);
    await pool.query(`DELETE FROM routine WHERE name = ?`, ['Push']);
    await pool.query(`DELETE FROM exercise_muscle WHERE exercise_name = ? AND muscle_name = ?`, ['Bicep Curl', 'Bicep Long Head']);
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

describe('Get Exercise Muscle', () => {
    it("Get exercise muscle", async() => {
        const [exMusc] = await getExerciseMuscleFocus("Bicep Curl", "Bicep Long Head");
        expect(exMusc['exercise_name']).toEqual("Bicep Curl");
        expect(exMusc['muscle_name']).toEqual("Bicep Long Head");
        expect(exMusc['focus']).toEqual('0.15');
    })
});

describe('Add muscle focus', () => {
    it("Add", async() => {
        await createExerciseMuscleFocus("Bicep Curl", "Bicep Short Head", 0.3);
        const [focus] = await getExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
        expect(focus['exercise_name']).toEqual("Bicep Curl");
        expect(focus['muscle_name']).toEqual("Bicep Short Head");
        expect(focus['focus']).toEqual('0.30');
        await pool.query(`DELETE FROM exercise_muscle WHERE exercise_name = ? AND muscle_name = ?`, ['Bicep Curl', 'Bicep Short Head']);
    }) 
})


it("Remove", async() => {
    await createExerciseMuscleFocus("Bicep Curl", "Bicep Short Head", 0.3);
    const [focus] = await getExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
    expect(focus['exercise_name']).toEqual("Bicep Curl");
    expect(focus['muscle_name']).toEqual("Bicep Short Head");
    expect(focus['focus']).toEqual('0.30');
    await removeExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
    const [after] = await getExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
    expect(after).toBeUndefined();
}) 

it("Change Focus Level", async() => {
    await createExerciseMuscleFocus("Bicep Curl", "Bicep Short Head", 0.3);
    const [before] = await getExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
    expect(before['focus']).toEqual('0.30');
    await changeFocusLevel("Bicep Curl", "Bicep Short Head", 0.5);
    const [after] = await getExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
    expect(after['focus']).toEqual('0.50');
    await removeExerciseMuscleFocus("Bicep Curl", "Bicep Short Head");
})

it("Adding, removing, getting and updating exercise to routine", async() => {
    await removeExerciseRoutine("Legs", "Squat");

    await createExercise("Squat", 5, 4);
    await createRoutine("Legs");
    await createExerciseRoutine("Legs", "Squat", 3);
    const [result] = await getExerciseRoutine("Legs", "Squat");
    expect(result['exercise_name']).toEqual('Squat');
    expect(result['routine_name']).toEqual('Legs');
    expect(result['num_sets']).toEqual(3);
    await changeNumSets("Legs", "Squat", 4);
    const [newResult] = await getExerciseRoutine("Legs", "Squat");
    expect(newResult['num_sets']).toEqual(4);
    await removeExerciseRoutine("Legs", "Squat");
    const [after] = await getExerciseRoutine("Legs", "Squat");
    expect(after).toBeUndefined();
    await removeExercise("Squat");
    await removeRoutine("Legs");
})

it("Adding, removing, getting and updating equipmentExercise", async() => {
    await createExercise("Barbell Curl", 3, 3);
    await createEquipmentExercise("Barbell", "Barbell Curl");
    const [result] = await getEquipmentExercise("Barbell", "Barbell Curl");
    expect(result['equipment_name']).toEqual('Barbell');
    expect(result['exercise_name']).toEqual('Barbell Curl');
    await removeEquipmentExercise("Barbell", "Barbell Curl");
    const [after] = await getEquipmentExercise("Barbell", "Barbell Curl");
    expect(after).toBeUndefined();
});