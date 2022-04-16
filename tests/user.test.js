const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setUpDatabase} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('should sign up user', async () => {
    const res = await request(app).post('/users').send({
        name: 'sarakorn',
        email: 'sarakkornsakol@gmail.com',
        password: '12345678'
    }).expect(201)
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()
    expect(res.body).toMatchObject({
        user: {
            name: 'sarakorn',
            email: 'sarakkornsakol@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('12345678')
})

test('should login exising user', async () => {
    const res = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(res.body.user._id)
    // console.log(res.body.token,user.tokens[1].token);
    expect(res.body.token).toBe(user.tokens[1].token)
})

test('should not login noexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'noexistent',
        password: 'nonexistent'
    }).expect(400)
})

test('should get profile for a user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for an unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)

})

test('should delete account for user', async () => {
    await request(app).delete('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    expect(200)
})

test('should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/avatar.png')
        .expect(200)
    const user = await User.findById(userOneId)
    // console.log(user);
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'shurricane edited'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('shurricane edited')
})
test('should not update invalid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'poipet'
        })
        .expect(400)
})
