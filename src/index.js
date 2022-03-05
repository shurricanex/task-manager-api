const app = require('./app')
const multer = require('multer')
const port = process.env.PORT

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000 //1MB
    },
    fileFilter (req,file,cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            cb(new Error('file must be extension of jpeg, jpg, png'))
        }
    }
})
app.post('/upload', upload.single('upload'), (req,res) => {
    res.send('uploaded')
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

