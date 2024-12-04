const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { pool, getExercise, bookmarkExercise, removeExercise, getAllExercises, createExercise,
    changeExercise, getRoutine, createRoutine, bookmarkRoutine, removeRoutine, updateRoutine,
    changeSets, getExerciseMuscleFocus, createExerciseMuscleFocus, removeExerciseMuscleFocus, changeFocusLevel,
    createExerciseRoutine, getExerciseRoutine, removeExerciseRoutine, changeNumSets,
    createEquipmentExercise, removeEquipmentExercise, getEquipmentExercise, getAllEquipment,
    getAllEquipmentForExercise, getAllRoutines, 
    getAllExercisesForRoutines} = require('./database.js');

const bar = "--------------";
const MUSCLEGROUPS = {
    "Chest": ["Mid Chest", "Upper Chest", "Lower Chest"], 
    "Shoulder": ["Front Delt", "Side Delt", "Rear Delt"],
    "Tricep": ["Tricep Long Head", "Tricep Lateral Head"],
    "Bicep": ["Bicep Long Head", "Bicep Short Head"],
    "Back": ["Upper Back", "Lats", "Traps"],
    "Legs": ["Quads", "Hamstrings", "Glutes", "Calves"]
};

async function listAllExercises() {
    result =  await getAllExercises();
    if (result && result.length > 0) {
        for (entry of result) {
            console.log(entry["name"]);
            console.log("Difficulty (0-5): " + entry["difficulty"]);
            console.log("Time Estimate: " + entry["time_estimate"]);
            var equipmentList = await getAllEquipmentForExercise(entry["name"]);
            equipmentList = equipmentList.filter(x => x !== undefined);
            if (equipmentList && equipmentList.length > 0) {
                console.log("Equipment Needed:");
                for (equipment of equipmentList) {
                    if (equipment !== undefined ) {
                        console.log(equipment);
                    }
                }
            } else {
                console.log("Exercise uses no equipment");
            }
            console.log("\n");
        }
        readlineSync.question("Press enter to continue... ");
    }
}

async function userRemoveEquipmentExercise(exercise) {
    while (true) {
        console.log(bar + "Removing Equipment" + bar);
        var equipmentList = await getAllEquipment();
        console.log("\n")
        console.log("List of equipment: ")
        for (item of equipmentList) {
            console.log(item['name']);
        }
        equipmentList = equipmentList.filter(element => element !== undefined);
        console.log("\n");
        var usedEquipment = await getAllEquipmentForExercise(exercise);
        usedEquipment = usedEquipment.filter(element => element !== undefined);
        if (usedEquipment.length === 0) {
            console.log("This exercise is not currently using any equipment");
        } else {
            console.log("This exercise is using the following equipment:");
            for (item of usedEquipment) {
                console.log(item);
            }
        }
        console.log("\n");
        var equipment = readlineSync.question("Enter the name of a new piece of equipment to remove (or q to quit): ");
        if (equipment === 'q') { return; }
        var flag = false
        for (item of equipmentList) {
            if (item['name'] === equipment) { flag = true; }
        }
        if (!flag) { 
            console.log("Please make sure that the given equipment exists");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        try {
            await removeEquipmentExercise(equipment, exercise);
            var [result] = await getEquipmentExercise(equipment, exercise);
            if (!result) {
                console.log("Equipment", chalk.blue(equipment),"succesfully removed from exercise", chalk.blue(exercise));
            }
            var response = readlineSync.question("Would you like to remove any other equipment from this exercise (y/n)?");
            if (response !== 'y' && response !== 'Y') {
                return;
            }
        } catch (err) {
            console.log("An error occured- make sure that this equipment is already being used by the exercise");
            readlineSync.question("Press enter to continue... ");
        }
    }
}


async function userCreateEquipmentExercise(exercise) {
    while (true) {
        console.log(bar + "Adding Equipment" + bar);
        var equipmentList = await getAllEquipment();
        console.log("\n")
        console.log("List of equipment: ")
        for (item of equipmentList) {
            console.log(item['name']);
        }
        equipmentList = equipmentList.filter(element => element !== undefined);
        console.log("\n");
        var usedEquipment = await getAllEquipmentForExercise(exercise);
        usedEquipment = usedEquipment.filter(element => element !== undefined);
        if (usedEquipment.length === 0) {
            console.log("This exercise is not currently using any equipment");
        } else {
            console.log("This exercise is using the following equipment:");
            for (item of usedEquipment) {
                console.log(item);
            }
        }
        console.log("\n");
        var equipment = readlineSync.question("Enter the name of a new piece of equipment to add (or q to quit): ");
        if (equipment === 'q') { return; }
        var flag = false;
        for (item of equipmentList) {
            if (item['name'] === equipment) { flag = true; }
        }
        if (!flag) { 
            console.log("Please make sure that the given equipment exists");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        try {
            await createEquipmentExercise(equipment, exercise);
            var [result] = await getEquipmentExercise(equipment, exercise);
            if (!result['equipment_name'] || !result['exercise_name']) {
                throw new Error("Bad user input");
            }
            console.log("Equipment", chalk.blue(result['equipment_name']),"succesfully added to exercise", chalk.blue(result['exercise_name']));
            var response = readlineSync.question("Would you like to add any other equipment to this exercise (y/n)?");
            if (response !== 'y' && response !== 'Y') {
                return;
            }
        } catch (err) {
            console.log("An error occured- make sure that this equipment is not already being used by the exercise");
            readlineSync.question("Press enter to continue... ");
        }
    }
}

async function userCreateExercise() {
    while (true) {
        console.log(bar + "CREATING EXERCISE" + bar);
        console.log("Enter the details of the exercise you want to create (or q to quit)");
        var name = readlineSync.question("What is the name of the exercise? ");
        if (name == 'q') { break }
        var diff = readlineSync.question("What is the difficulty rating of this exericse (1-5)? ");
        if (diff == 'q') { break }
        var time = readlineSync.question("How many minutes a does a set take (1-5)? ");
        if (time == 'q') { break }
        try {
            var [initial] = await getExercise(name);
            if (initial !== undefined) { 
                throw new Error();
            }
            await createExercise(name, diff, time);
            var [result] = await getExercise(name);
            if (!result['name'] || !result['difficulty'] || !result['time_estimate']) {
                throw new Error("Bad user input");
            }
            console.log("New succesfully exercise created with the name ", chalk.blue(result['name']),
                "with difficulty rating of", result['difficulty'], "and takes", result['time_estimate'], "minutes");
            var newEquipment = readlineSync.question("Does this exercise require equipment? (y/n): ");
            if (newEquipment === 'y' || newEquipment === 'Y') {
                await userCreateEquipmentExercise(name);
            }
            var newExercise = readlineSync.question("Would you like to make another exercise (y/n): ");
            if (newExercise !== 'y' && newExercise !== 'Y') {
                return;
            }
        } catch (err) {
            console.log("An error occured- make sure that the name is new and unique, and time and difficulty are integers between 1 and 5")
            readlineSync.question("Press enter to continue... ");
        }
    }
}

async function userUpdateExercise() {
    while (true) {
        console.log(bar + "Exercise Modification" + bar);
        var name = readlineSync.question("Enter the name of the exercise you wish to modify (or q to quit): ");
        if (name === 'q' || name === 'Q') { return; }
        var [existingEntry] = await getExercise(name)
        if (existingEntry === undefined) {
            console.log("Name not recognzied- please try again");
            continue;
        }
        console.log("Choose one of the following options\n" +
            "1 to change the name\n" +
            "2 to change the difficulty\n" +
            "3 to change the time estiamte\n" +
            "4 to change the equipment used\n" +
            "q to quit");
        var command = readlineSync.question("Enter your command here: ");
        switch (command) {
            case ('q'):
            case ('Q'):
                return;
            case ('1'):
                var newName = readlineSync.question("What is the new name to use? ");
                try {
                    await changeExercise(name, "name", newName);
                    var [newExercise] = await getExercise(newName);
                    console.log("Name change succesful, exercise now is: ")
                    console.log(newExercise['name']);
                    console.log("Difficulty (0-5): " + newExercise['difficulty'] )
                    console.log("Time Estimate: " + newExercise['time_estimate']);
                } catch (err) {
                    console.log("An error occured- make sure your new name doesn't already exist");
                    readlineSync.question("Press enter to continue... ");
                }
                break;
            case ('2'):
                var newDifficulty = readlineSync.question("What is the new difficulty value?: ");
                try {
                    await changeExercise(name, "difficulty", newDifficulty);
                    var [newExercise] = await getExercise(name);
                    console.log("Difficulty change succesful, exercise now is: ")
                    console.log(newExercise['name']);
                    console.log("Difficulty (0-5): " + newExercise['difficulty']);
                    console.log("Time Estimate: " + newExercise['time_estimate']);
                } catch (err) {
                    console.log("An error occured- make sure your new value is between 1 and 5");
                    readlineSync.question("Press enter to continue... ");
                }
                break;
            case ('3'):
                var newTime = readlineSync.question("What is the new time estimate value?: ");
                try {
                    await changeExercise(name, "time_estimate", newTime);
                    var [newExercise] = await getExercise(name);
                    console.log("Difficulty change succesful, exercise now is: ");
                    console.log(newExercise['name']);
                    console.log("Difficulty (0-5): " + newExercise['difficulty']);
                    console.log("Time Estimate: " + newExercise['time_estimate']);
                } catch (err) {
                    console.log("An error occured- make sure your new value is above 0");
                    readlineSync.question("Press enter to continue... ");
                }
                break;
            case ('4'):
                var addOrRemove = readlineSync.question("Enter 1 to add equipment, 2 to remove, or q to quit: ");
                switch (addOrRemove) {
                    case ('1'):
                        await userCreateEquipmentExercise(name);
                        break;
                    case ('2'):
                        await userRemoveEquipmentExercise(name);
                        break;
                    case ('Q'):
                    case ('q'):
                        break;
                    default:
                        console.log("Invalid input, try again");
                }
                break;
            default:
                console.log("Not a valid command, try again");
                readlineSync.question("Press enter to continue... ");
        }
    }
}

async function userRemoveExercise() {
    while (true) {
        console.log(bar + "Exercise Removal" + bar);
        var name = readlineSync.question("which exercise would you like to remove? (or q to quit): ");
        if (name === 'q' || name === 'Q') { return; }
        var [before] = await getExercise(name);
        if (before === undefined) {
            console.log("Name not recognized, please try again.");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        await removeExercise(name);
        var [result] = await getExercise(name);
        if (result) { 
            console.log("Removal unsuccessful please try again.");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        console.log(chalk.red(name) + " succesfully removed");
        var response = readlineSync.question("Would you like to remove another exercise (y/n)?: ");
        if (response !== "Y" && response !== 'y') {
            return;
        }
    }
}

async function manageExercises() {
    while (true) {
        console.log(bar + "Exercise Management" + bar);
        console.log("Choose one of the following options:\n"+
            "1 to get all exercises\n"+
            "2 to create an exercise\n" +
            "3 to modify an exercise\n" +
            "4 to delete an exercise\n" +
            "5 to see a specific exercise\n" +
            "6 to see all equipment\n" +
            "q to quit (at any time in the program)"
         );
        var input = readlineSync.question("Enter your command: ");
        switch (input) {
            case ("q"):
            case ("Q"):
                return;
            case ("1"):
                await listAllExercises();
                break;
            case ("2"):
                await userCreateExercise();
                break;
            case ("3"):
                await userUpdateExercise();
                break;
            case ("4"):
                await userRemoveExercise();
                break;
            case ("5"):
                var name = readlineSync.question("Enter the name of the exercise here: ");
                var [exercise] = await getExercise(name);
                if (exercise !== undefined) {
                    console.log(exercise['name']);
                    console.log("Difficulty (0-5): " + exercise['difficulty'] )
                    console.log("Time Estimate: " + exercise['time_estimate']);
                    var usedEquipment = await getAllEquipmentForExercise(name);
                    usedEquipment = usedEquipment.filter(element => element !== undefined);
                    if (usedEquipment.length === 0) {
                        console.log("This exercise is not currently using any equipment");
                    } else {
                        console.log("This exercise is using the following equipment:");
                        for (item of usedEquipment) {
                            console.log(item);
                        }
                    }
                } else {
                    console.log("Name not recognized, please try again");
                }
                readlineSync.question("Press enter to continue... ");
                break;
        
            case ('6'):
                var equipmentList = await getAllEquipment();
                console.log("\nList of equipment: ")
                for (item of equipmentList) {
                    if (item !== undefined && item['name'] !== undefined) {
                        console.log(item['name']);
                    }
                }
                readlineSync.question("Press enter to continue... \n");
                break;
            default:
                console.log("Not a valid command, try again");
                readlineSync.question("Press enter to continue... ");
                break;
        }
    }
}

async function listAllRoutines() {
    result = await getAllRoutines();
    if (result) {
        for (entry of result) {
            console.log("\n")
            console.log(entry["name"]);
            console.log("Estimated Duration:", entry["est_duration"]);
            console.log("Overall Intensity:", entry["overall_intensity"]);
            var exercises = await getAllExercisesForRoutines(entry['name']);
            exercises = exercises.filter(entry => entry !== undefined);
            if (exercises && exercises.length > 0) {
                console.log("Exercises belonging to", entry['name'] + ":");
                for (var exercise of exercises) {
                    if (exercise) {
                        console.log(exercise['exercise_name']);
                        console.log("Num Sets:", exercise['num_sets']);
                    }
                }
            } else {
                console.log("Routine currently has no exercises");
            }
        }
    }
    else {
        console.log("No routines found");
    }
    readlineSync.question("Press enter to continue... ");
}


async function userAddExerciseToRoutine(routineName) {
    var [routine] = await getRoutine(routineName);
    if (!routine) {
        throw new Error();
    }
    while (true) {
        try {
            console.log(bar + "Adding exercise to", chalk.blue(routineName) + bar);
            var name = readlineSync.question("What exercise would you like to add? ");
            if (name === 'q' || name === 'Q') { return; }
            var [exercise] = await getExercise(name);
            if (!exercise) {
                throw new Error();
            }
            var numSets = readlineSync.question("How many sets of this exercise? ");
            if (numSets === 'q' || name === 'Q') { return; }
            if (numSets < 1) { throw new Error(); }
            await createExerciseRoutine(routineName, name, numSets);
            var [after] = await getExerciseRoutine(routineName, name);
            if (!after || !after['routine_name'] || !after['exercise_name']) {
                throw new Error();
            }
            console.log("Succesfully added " + chalk.blue(name) + " to " + chalk.magenta(routineName) + " with " + chalk.red(numSets) + " sets");
            var addAnother = readlineSync.question("Would you like to add another exercise (y/n)?: ");
            if (addAnother !== 'Y' && addAnother !== 'y') {
                return;
            }
        } catch (err) {
            console.log("An error occured- make sure the name you give exists and the number of sets is above 0");
            readlineSync.question("Press enter to continue... ");
        }
    }
}

async function userCreateRoutine() {
    while (true) {
        console.log(bar + "CREATING ROUTINE" + bar);
        var name = readlineSync.question("What is the name of the routine?: ");
        if (name == 'q') { break; }
        try {
            var [initial] = await getRoutine(name);
            if (initial) {
                throw new Error();
            }
            await createRoutine(name);
            var [after] = await getRoutine(name);
            if (!after || !after['name']) {
                throw new Error();
            } 
            console.log("New routine created with the name:", chalk.blue(after['name']));
            var addExercise = readlineSync.question("Would you like to add exercises to this routine? (y/n): ");
            if (addExercise === 'y' || addExercise === 'Y') {
                await userAddExerciseToRoutine(after['name']);
            }
            var newRoutine = readlineSync.question("Would you like to add another routine? (y/n): ");
            if (newRoutine !== 'y' && newRoutine !== 'Y') {
                return;
            }
        } catch (err) {
            console.log("An error occured: Make sure the name is new and unique");
        }
    }
}


async function userRemoveExerciseFromRoutine(routineName) {
    var [routine] = await getRoutine(routineName);
    if (!routine) {
        throw new Error();
    }
    while (true) {
        try {
            console.log(bar + "Removing exercise from", chalk.red(routineName) + bar);
            var name = readlineSync.question("What exercise would you like to remove? ");
            if (name === 'q' || name === 'Q') { return; }
            var exercise = await getExerciseRoutine(routineName, name);
            if (!exercise || exercise.length === 0) {
                throw new Error("Exercise not found");
            }
            await removeExerciseRoutine(routineName, name);
            var [after] = await getExerciseRoutine(routineName, name);
            if (after && after['routine_name'] && after['exercise_name']) {
                throw new Error("Exercise unsuccesfully removed");
            }
            console.log("Succesfully removed " + chalk.red(name) + " from " + chalk.blue(routineName));
            var removeAnother = readlineSync.question("Would you like to remove another exercise (y/n)?: ");
            if (removeAnother !== 'Y' && removeAnother !== 'y') {
                return;
            }
        } catch (err) {
            console.log("An error occured- make sure exercise is actually used by this exercise");
            readlineSync.question("Press enter to continue... ");
        }
    }
}


// MAY NEED TO DEAL WITH THE WHILE LOOP HERE IN A WEIRD WAY
async function userModifyRoutineExercises(routineName) {
    while (true) {
        var [routine] = await getRoutine(routineName);
        if (!routine) {
            throw new Error();
        }
        console.log(bar + "Modifying " + chalk.blue(routineName) + chalk.blue("'s") + " exercises");
        var exercises = await getAllExercises();
        exercises = exercises.filter(x => x !== undefined);
        if (exercises && exercises.length > 0) {
            console.log("List of Exercises (in the database): ");
            for (entry of exercises) {
                console.log(entry['name']);
            }
        }
        var usedExercises = await getAllExercisesForRoutines(routineName);
        usedExercises = usedExercises.filter(x => x !== undefined);
        if (usedExercises && usedExercises.length > 0) {
            console.log("List of exercises used by this routine: ");
            for (entry of usedExercises) {
                console.log(entry['exercise_name'], "with", chalk.green(entry['num_sets']), "sets");
            }
        }
        else {
            console.log("This routine is not using any exercises");
            console.log("\n")
        }
        console.log("Choose one of the following options:\n" + 
            "1 to add an exercise to this routine\n" +
            "2 to remove an exercise to this routine\n" + 
            "3 to change the number of sets of an exercise" +
            "q to quit"
        );
        var input = readlineSync.question("Enter your command here: ");
        if (input === 'q' || input === 'Q') { return; }
        else if (input === '1') {
            await userAddExerciseToRoutine(routineName);
        } else if (input === '2') {
            await userRemoveExerciseFromRoutine(routineName);
        } else if (input === '3') {

        }
        else {
            console.log("Unrecognized input, please try again");
        }
        var addMore = readlineSync.question("Would you like to modify this routine more? (y/n): ");
        if (addMore !== 'y' && addMore !== 'Y') {
            return;
        }
    }
}

async function userUpdateRoutine() {
    while (true) {
        console.log(bar + "Routine Update" + bar);
        var name = readlineSync.question("Which routine would you like to update? (q to quit): ");
        if (name === 'q' || name === 'Q') { return; }
        var [before] = await getRoutine(name);
        if (!before) {
            console.log("Name not recognized, please try again");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        console.log("Choose one of the following options:\n" +
            "1 to change the name\n" +
            "2 to modify exercises in the routine\n" +
            "q to quit"
        );
        var input = readlineSync.question("Enter your command here: ");
        switch (input) {
            case ('Q'):
            case ('q'):
                return;
            case ('1'):
                while (true) {
                    var newName = readlineSync.question("What is the new name of this routine? (or q to quit): ");
                    if (newName === 'q' || newName === 'Q') { break; }
                    try {
                        await updateRoutine(name, newName);
                        var [after] = await getRoutine(newName);
                        var exercises = await getAllExercisesForRoutines(routine['name']);
                        exercises = exercises.filter(entry => entry !== undefined);
                        for (var exercise of exercises) {
                            await userAddExerciseToRoutine(exercise['exercise_name']);
                        }
                        if (after) {
                            console.log(chalk.red(name) + " succesfully renamed to " + chalk.blue(after['name']));
                            break;
                        } else {
                            throw new Error("Renaming failed");
                        }
                    } catch (err) {
                        console.log(err);
                        console.log("An error occured- make sure your new name does not already exist in the database");
                    }
                    var renameMore = readlineSync.question("Would you like to rename another routine? (y/n) ");
                    if (renameMore !== 'y' && renameMore !== 'Y') {
                        return;
                    }
                }
                break;
            case ('2'):
                await userModifyRoutineExercises(name);
                break;
            default:
                console.log("Invalid command, please try again");
                readlineSync.question("Press enter to continue... ");
                break;
        }
    }
}


async function userRemoveRoutine() {
    while (true) {
        console.log(bar + "Routine Removal" + bar);
        var name = readlineSync.question("Which routine would you like to remove?: ");
        if (name === 'q' || name === 'Q') { return; }
        var [before] = await getRoutine(name);
        if (!before) {
            console.log("Name not recognized, please try again");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        await removeRoutine(name);
        var [result] = await getRoutine(name);
        if (result) { 
            console.log("Removal unsuccessful please try again.");
            readlineSync.question("Press enter to continue... ");
            continue;
        }
        console.log(chalk.red(name) + " succesfully removed");
        var response = readlineSync.question("Would you like to remove another exercise (y/n)?: ");
        if (response !== "Y" && response !== 'y') {
            return;
        }
    }
}

async function manageRoutines() {
    while (true) {
        console.log(bar + "Routine Management" + bar);
        console.log("Choose one of the following options:\n" +
            "1 to see all routines\n" +
            "2 to add a new routine\n" +
            "3 to update a routine\n" +
            "4 to remove a routine\n" +
            "5 to see a specific routine\n" +
            "q to quit (at any point in the program)" 
        );
        var input = readlineSync.question("Enter your command: ");
        switch (input) {
            case ('1'):
                await listAllRoutines();
                break;
            case ('2'):
                await userCreateRoutine();
                break;
            case ('3'):
                await userUpdateRoutine();
                break;
            case ('4'):
                await userRemoveRoutine();
                break;
            case ('5'):
                var name = readlineSync.question("What is the name of the routine to get?: ");
                var [routine] = await getRoutine(name);
                if (routine) {
                    console.log(routine['name']);
                    console.log("Est. Duration", routine['est_duration']);
                    console.log("Difficulty:", routine['overall_intensity']);
                    var exercises = await getAllExercisesForRoutines(routine['name']);
                    console.log(exercises);
                    if (exercises && exercises.length > 0) {
                        console.log("Exercises belonging to", chalk.blue(routine['name']) + ":");
                        console.log("\n");
                        exercises = exercises.filter(entry => entry !== undefined);
                        for (var exercise of exercises) {
                            if (exercise) {
                                console.log(exercise['exercise_name']);
                            }
                        }
                    } else {
                        console.log("Routine currently has no exercises");
                    }
                } else {
                    console.log("Error: Please make sure the given routine name exists");
                }
                readlineSync.question("Press enter to continue... ");
                break;
            case ('q'):
            case ('Q'): 
                return;
        }
    }
}


async function main() {
    while (true) {
        var input = readlineSync.question("Press e to open exercises, r to open routines, or q to quit: ");
        if (input === "E" || input === "e") {
            await manageExercises();
        } else if (input === "R" || input === "r") {
            await manageRoutines();
        } else if (input === "Q" || input === "q") {
            break;
        } else {
            console.log("Not a valid command, please try again. ");
        }
    }
    console.log("Goodbye!");
    process.exit(0);
}

(async () => {
    try {
        main();
    }
    catch (err) {
        console.log("An error occured:", err);
    }
})();
