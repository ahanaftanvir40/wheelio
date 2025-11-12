import multer from 'multer'
import path from 'path'
import crypto from 'crypto'


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath
        if (file.fieldname === 'avatar') {
            uploadPath = './public/images/user-avatars'
        } else if (file.fieldname === 'licenseFile') {
            uploadPath = './public/images/license-images'
        } else if (file.fieldname === 'vehicleImages') {
            uploadPath = './public/images/vehicle-images'
        }

        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(10, (err, bytes) => {
            const fn = bytes.toString('hex') + path.extname(file.originalname)
            cb(null, fn)
        })

    }
})

export const upload = multer({ storage: storage })

