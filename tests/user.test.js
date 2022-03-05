const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const jwt = require('jsonwebtoken')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'shurricane',
    email: 'shurricanex@gmail.com',
    password: '1234567',
    tokens:[{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach(async()=>{
    await User.deleteMany()
    await new User(userOne).save()
})

test('should sign up user',async () => {
    await request(app).post('/users').send({
        name: 'sarakorn',
        email: 'sarakkornsakol@gmail.com',
        password: '12345678'
    }).expect(201)
})

test('should login exising user',async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('should not login noexistent user', async() => {
    await request(app).post('/users/login').send({
        email: 'noexistent',
        password: 'nonexistent'
    }).expect(400)
})

test('should get profile for a user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for an unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
        
})