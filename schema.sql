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
    FOREIGN KEY (equipment_name) REFERENCES equipment(name),
    FOREIGN KEY (exercise_name) REFERENCES exercise(name)
);

DROP TABLE IF EXISTS muscle_group;
CREATE TABLE muscle_group (
    name VARCHAR(255) PRIMARY KEY
);

DROP TABLE IF EXISTS muscle;
CREATE TABLE muscle (
    name VARCHAR(255) PRIMARY KEY,
    muscle_group_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (muscle_group_name) REFERENCES muscle_group(name)
);

DROP TABLE IF EXISTS exercise_muscle;
CREATE TABLE exercise_muscle (
    exercise_name VARCHAR(255) NOT NULL,
    muscle_name VARCHAR(255) NOT NULL,
    focus DECIMAL(3, 2) NOT NULL DEFAULT 1.00 CHECK (focus BETWEEN 0.00 AND 1.00),
    PRIMARY KEY (exercise_name, muscle_name),
    FOREIGN KEY (exercise_name) REFERENCES exercise(name),
    FOREIGN KEY (muscle_name) REFERENCES muscle(name)
);

DROP TABLE IF EXISTS routine;
CREATE TABLE routine (
    name VARCHAR(255) PRIMARY KEY,
    est_duration INT NOT NULL DEFAULT 0, -- DERIVED ATTRIBUTE, TO BE IMPLEMENTED LATER --
    overall_intensity INT NOT NULL DEFAULT 0, -- DERIVED ATTRIBUTE, TO BE IMPLEMENTED LATER --
    bookmarked BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS routine_exercise; 
CREATE TABLE routine_exercise (
    routine_name VARCHAR(255) NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    num_sets INT NOT NULL CHECK (num_sets > 0),
    PRIMARY KEY(routine_name, exercise_name),
    FOREIGN KEY(routine_name) REFERENCES routine(name),
    FOREIGN KEY(exercise_name) REFERENCES exercise(name)
);

DROP TABLE IF EXISTS routine_muscle;
CREATE TABLE routine_muscle (
    routine_name VARCHAR(255) NOT NULL,
    muscle_name VARCHAR(255) NOT NULL,
    focus DECIMAL(3, 2) NOT NULL DEFAULT 1.00 CHECK (focus BETWEEN 0.00 AND 1.00),
    PRIMARY KEY(routine_name, muscle_name),
    FOREIGN KEY(routine_name) REFERENCES routine(name),
    FOREIGN KEY(muscle_name) REFERENCES muscle(name)
);

DROP TABLE IF EXISTS routine_muscle_group;
CREATE TABLE routine_muscle_group (
    routine_name VARCHAR(255) NOT NULL,
    muscle_group_name VARCHAR(255) NOT NULL,
    focus DECIMAL(3, 2) NOT NULL DEFAULT 1.00 CHECK (focus BETWEEN 0.00 AND 1.00),
    PRIMARY KEY(routine_name, muscle_group_name),
    FOREIGN KEY(routine_name) REFERENCES routine(name),
    FOREIGN KEY(muscle_group_name) REFERENCES muscle_group(name)
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

INSERT INTO exercise (name, difficulty, time_estimate) VALUES ('Bench Press', 4, 3);
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Mid Chest', 0.60)
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Tricep Long Head', 0.10);
INSERT INTO exercise_muscle(exericse_name, muscle_name, focus) VALUES ('Bench Press', 'Tricep Lateral Head', 0.10);
INSERT INTO exercise_muscle(exercise_name, muscle_name, focus) VALUES ('Bench Press', 'Front Delt', 0.20);
INSERT INTO exercise (name, difficulty, time_estimate) VALUES ('Bicep Curl', 2, 2);