const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')

const { sendEmail, sendFarewellEmail } = require('../emails/account')
const router = new express.Router()
const sharp = require('sharp')
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // console.log(`request body ${user}`)
    try {
        await user.save();
        sendEmail(user.email,user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = req.user;
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})
const upload = multer({

    dest: 'avatar',
    limits: {
        fileSize: 1000000000
    },
    storage: multer.memoryStorage(),
    fileFilter (req,file,cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            cb(new Error('file must be extension of jpeg, jpg, png'))
        }
        cb(undefined,true)
    }
})
// router.post('/users/me/avatar', uploadhandler.single('avatar'), async (req,res) => {
//     const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
//     req.user.avatar = buffer
//     await req.user.save()
//     res.send(req.user)

// }, (error,req,res,next) => {
//     res.status(400).send({error: error.message})
// })
router.post('/users/me/avatar', auth, upload.single('avatar'),  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save(req.user)
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
router.delete('/users/me',auth, async (req,res) => {
    try{
        const user = req.user;
        user.remove();
        sendFarewellEmail(user.email,user.name)
        res.send('user deleted')
    } catch(e){
        res.status(500).send()
    }
})


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findUserByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {

    try {

        const user = req.user;
        const tokens = user.tokens.filter(token => token.token !== req.token);
        // console.log(`tokens: ${tokens}`);
        user.tokens = tokens;
        await user.save();
        res.send('logged out')

    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router