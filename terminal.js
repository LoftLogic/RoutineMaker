const readlineSync = require('readline-sync');
const chalk = require('chalk');
const { pool, getExercise, bookmarkExercise, removeExercise, getAllExercises, createExercise,
    changeExercise, getRoutine, createRoutine, bookmarkRoutine, removeRoutine, updateRoutine,
    getExerciseMuscleFocus, createExerciseMuscleFocus, removeExerciseMuscleFocus, changeFocusLevel,
    createExerciseRoutine, getExerciseRoutine, removeExerciseRoutine, changeNumSets,
    createEquipmentExercise, removeEquipmentExercise, getEquipmentExercise, getAllEquipment,
    getAllEquipmentForExercise } = require('./database.js');

const bar = "--------------";

async function listAllExercises() {
    result =  await getAllExercises();
    if (result) {
        for (entry of result) {
            console.log(entry["name"]);
            console.log("Difficulty (0-5): " + entry["difficulty"]);
            console.log("Time Estimate (0-5): " + entry["time_estimate"]);
            console.log("Equipment Needed:");
            for (equipment of await getAllEquipmentForExercise(entry["name"])) {
                if (equipment['name'] !== undefined ) {
                    console.log(equipment['name']);
                }
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

async function userCreateExecise() {
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
        if (name === 'q') { return; }
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
                    console.log("Time Estimate (0-5): " + newExercise['time_estimate']);
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
                    console.log("Time Estimate (0-5): " + newExercise['time_estimate']);
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
                    console.log("Time Estimate (0-5): " + newExercise['time_estimate']);
                } catch (err) {
                    console.log("An error occured- make sure your new value is between 1 and 5");
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
            
                    default:
                        console.log("Invalid input, try again");
                }
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
            "5 to see all equipment\n" +
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
                await userCreateExecise();
                break;
            case ("3"):
                await userUpdateExercise();
                break;
            default:
                console.log("Not a valid command, try again");
                readlineSync.question("Press enter to continue... ");
                break;
        }
    }
}

async function main() {
    while (true) {
        var input = readlineSync.question("Press e to open exercises, r to open routines, or q to quit: ");
        if (input === "E" || input === "e") {
            await manageExercises();
        } else if (input === "R" || input === "r") {
            while (true) {
                input = readlineSync.question("Press q to quit");
                if (input == "Q") { break; }
            }
        } else if (input === "Q" || input === "q") {
            break;
        } else {
            console.log("Not a valid command, please try again. ");
        }
    }
    console.log("Goodbye!");
    return;
}

main();
