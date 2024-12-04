DROP DATABASE IF EXISTS routines;
CREATE DATABASE routines;
USE routines;

DROP TABLE IF EXISTS equipment;
CREATE TABLE equipment (
    name VARCHAR(255) PRIMARY KEY
);

DROP TABLE IF EXISTS exercise;
CREATE TABLE exercise (
    name VARCHAR(255) PRIMARY KEY,
    difficulty int NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    time_estimate int NOT NULL CHECK (time_estimate > 0),
    bookmarked boolean NOT NULL DEFAULT false
);

DROP TABLE IF EXISTS equipment_exercise;
CREATE TABLE equipment_exercise (
    equipment_name VARCHAR(255) NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (equipment_name, exercise_name),
    FOREIGN KEY (equipment_name) REFERENCES equipment(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (exercise_name) REFERENCES exercise(name) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS muscle_group;
CREATE TABLE muscle_group (
    name VARCHAR(255) PRIMARY KEY
);

DROP TABLE IF EXISTS muscle;
CREATE TABLE muscle (
    name VARCHAR(255) PRIMARY KEY,
    muscle_group_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (muscle_group_name) REFERENCES muscle_group(name) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS exercise_muscle;
CREATE TABLE exercise_muscle (
    exercise_name VARCHAR(255) NOT NULL,
    muscle_name VARCHAR(255) NOT NULL,
    focus DECIMAL(3, 2) NOT NULL DEFAULT 1.00 CHECK (focus BETWEEN 0.00 AND 1.00),
    PRIMARY KEY (exercise_name, muscle_name),
    FOREIGN KEY (exercise_name) REFERENCES exercise(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (muscle_name) REFERENCES muscle(name) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS routine;
CREATE TABLE routine (
    name VARCHAR(255) PRIMARY KEY,
    est_duration INT NOT NULL DEFAULT 0, -- DERIVED ATTRIBUTE --
    overall_intensity INT NOT NULL DEFAULT 0, -- DERIVED ATTRIBUTE --
    bookmarked BOOLEAN NOT NULL DEFAULT false
);

DROP TABLE IF EXISTS routine_exercise; 
CREATE TABLE routine_exercise (
    routine_name VARCHAR(255) NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    num_sets INT NOT NULL CHECK (num_sets > 0),
    PRIMARY KEY(routine_name, exercise_name),
    FOREIGN KEY(routine_name) REFERENCES routine(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(exercise_name) REFERENCES exercise(name) ON UPDATE CASCADE ON DELETE CASCADE
);

DELIMITER $$
CREATE TRIGGER calculate_routine_metrics
AFTER INSERT ON routine_exercise FOR EACH ROW
BEGIN
    DECLARE total_duration INT DEFAULT 0;
    DECLARE total_intensity DECIMAL(5, 2) DEFAULT 0.00;
    DECLARE total_sets INT DEFAULT 0;

    SELECT 
        SUM(exercise.time_estimate * routine_exercise.num_sets),
        SUM(exercise.difficulty * routine_exercise.num_sets),
        SUM(routine_exercise.num_sets)
    INTO total_duration, total_intensity, total_sets
    FROM routine_exercise
    JOIN exercise ON exercise.name = routine_exercise.exercise_name
    WHERE routine_exercise.routine_name = NEW.routine_name;

    UPDATE routine
    SET est_duration = total_duration,
        overall_intensity = CASE WHEN total_sets > 0
                                THEN ROUND(total_intensity / total_sets)
                                ELSE 0
                            END
    WHERE name = NEW.routine_name;
END $$

DELIMITER $$
CREATE TRIGGER update_exercise_trigger
AFTER UPDATE ON exercise
FOR EACH ROW
BEGIN
    UPDATE routine_exercise
    SET num_sets = num_sets -- Dummy update to trigger routine calculations--
    WHERE exercise_name = NEW.name;
END $$

DELIMITER;

INSERT INTO equipment (name) VALUES ('Bench');
INSERT INTO equipment (name) VALUES ('Barbell');
INSERT INTO equipment (name) VALUES ('Dumbell');
INSERT INTO equipment (name) VALUES ('Cable');
INSERT INTO equipment (name) VALUES ('Machine');
INSERT INTO equipment (name) VALUES ('Yoga Mat');

INSERT INTO muscle_group(name) VALUES ('Chest');
INSERT INTO muscle_group(name) VALUES ('Shoulder');
INSERT INTO muscle_group(name) VALUES ('Tricep');
INSERT INTO muscle_group(name) VALUES ('Bicep');
INSERT INTO muscle_group(name) VALUES ('Back');
INSERT INTO muscle_group(name) VALUES ('Legs');
INSERT INTO muscle_group(name) VALUES ('Abs');

INSERT INTO muscle(name, muscle_group_name) VALUES ('Mid Chest', 'Chest');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Upper Chest', 'Chest');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Lower Chest', 'Chest');

INSERT INTO muscle(name, muscle_group_name) VALUES ('Front Delt', 'Shoulder');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Side Delt', 'Shoulder');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Rear Delt', 'Shoulder');

INSERT INTO muscle(name, muscle_group_name) VALUES ('Tricep Long Head', 'Tricep');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Tricep Lateral Head', 'Tricep');

INSERT INTO muscle(name, muscle_group_name) VALUES ('Bicep Long Head', 'Bicep');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Bicep Short Head', 'Bicep');

INSERT INTO muscle(name, muscle_group_name) VALUES ('Upper Back', 'Back');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Lats', 'Back');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Traps', 'Back');

INSERT INTO muscle(name, muscle_group_name) VALUES ('Quads', 'Legs');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Hamstrings', 'Legs');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Glutes', 'Legs');
INSERT INTO muscle(name, muscle_group_name) VALUES ('Calves', 'Legs');


INSERT INTO exercise (name, difficulty, time_estimate) VALUES ('Bench Press', 4, 3);
INSERT INTO exercise (name, difficulty, time_estimate) VALUES ('Bicep Curl', 2, 2);
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Mid Chest', 0.60);
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Tricep Long Head', 0.10);
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Tricep Lateral Head', 0.10);
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Front Delt', 0.20);