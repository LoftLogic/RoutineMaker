const request = require('supertest');
const app = require('../app'); 
const { pool } = require('../database');

beforeAll(async () => {
    await pool.query(`INSERT INTO exercise (name, difficulty, time_estimate) VALUES ('Squat', 2, 3)`);
});

afterAll(async () => {
    await pool.query(`DELETE FROM exercise WHERE name = 'Squat'`);
    await pool.end();
});

describe('Test getting exercise by name', () => {
    it('Should be able to retrieve an exercise by name', async () => {
        const response = await request(app).get('/exercise/Squat');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', 'Squat');
        expect(response.body).toHaveProperty('difficulty', 2);
        expect(response.body).toHaveProperty('time_estimate', 3)
    });
    it('Should return a 404 with unknown name', async () => {
        const response = await request(app).get('/exercise/dne');
        expect(response.status).toBe(404);
    })
})