const express = require('express');
const { pool, getExercise, getAllExercises, getRoutine, bookmarkExercise, createExercise } = require('./database.js');

const app = express();
app.use(express.json());

app.get("/exercise/:name", async (req, res) => {
    const name = req.params.name;
    const exercise = await getExercise(name);
    if (!exercise || exercise.length === 0) {
        return res.status(404).send({ error: "Exercise not found" });
    }
    res.send(exercise);
});

app.get("/exercise", async (req, res) => {
    const exercises = await getAllExercises();
    res.send(exercises)
});

app.get("/routine", async (req, res) => {
    const name = req.params.name;
    const routine = await getRoutine(name);
    if (!routine) {
        return res.status(404).send({ error: "Routine not found" });
    }
    res.send(routine)
});

app.post("/exercise", async (req, res) => {
    const {name, difficulty, time_estimate} = req.body;
    try {
        const exercise = await createExercise(name, difficulty, time_estimate);
        res.status(201).send(exercise);
    } catch (error) {
        console.error("Error creating exercise:", error);
        res.status(500).send({ error: "An error occurred while creating the exercise." }); 
    }
});

app.post("/notes", async (req, res) => {
    const {title, contents} = req.body;
    const note = await createNote(title, contents);
    res.status(201).send(note);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something Broke!");
});

app.use((req, res, next) => {
    res.status(404).send({ error: "Not Found" });
});

app.listen(8000, () => {
    console.log("Server listening on port 8000");
});

module.exports = app;