import express from 'express'
import { User } from '../models/user.models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { upload } from '../config/multer-config.js'
import { auth } from '../middlewares/auth.js'
import { Vehicle } from '../models/vehicle.models.js'
import { AdminAuth } from '../middlewares/admin-auth.js'
import { z } from 'zod'



const router = express.Router()

router.post('/createuser', upload.fields([{ name: 'avatar' }, { name: 'licenseFile' }]), async (req, res) => {
    let { userType } = req.body
    const avatar = req.files['avatar'] ? req.files['avatar'][0].filename : 'default.jpg'
    const licenseFile = req.files['licenseFile'] ? req.files['licenseFile'][0].filename : null;

    const useSchema = z.object({
        name: z.string().min(1, 'Name must be more than 1 character'),
        email: z.string().email('Please Enter a Valid Email'),
        password: z.string().min(6, 'Password must be atleast 6 characters long'),
        nationalId: z.string().min(10, 'Please Enter a Valid NID').optional(),
        drivingLicense: z.string().min(16, 'Please Enter a Valid Driving License').optional(),
        phoneNumber: z.string().min(11, 'Please Enter a Valid Contact Number')

    })
    try {

        const result = useSchema.safeParse(req.body)
        if (!result.success) {
            return res.json({ message: 'Invalid Inputs', error: result.error.errors })
        }
        if (result && result.data) {
            const { name, email, password, drivingLicense, nationalId, phoneNumber } = result.data
            let user = await User.findOne({ email: email })
            if (user) {
                return res.json({ success: false });
            }
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, async (err, hash) => {
                    await User.create({
                        avatar,
                        userType,
                        name,
                        email,
                        password: hash,
                        phoneNumber,
                        licenseFile,
                        drivingLicense,
                        nationalId
                    })
                })
            })
        }


        return res.json({ success: true })

    } catch (error) {
        console.log(error);
        res.json({ success: false, error: error.message })
    }

})

router.post('/loginuser', async (req, res) => {
    let { email, password } = req.body
    try {
        let userData = await User.findOne({ email: email })
        if (!userData) {
            res.json({ success: false })
        }
        if (userData) {
            bcrypt.compare(password, userData.password, function (err, result) {
                if (result) {
                    let authToken = jwt.sign({ id: userData.id, email: userData.email, isAdmin: userData.isAdmin }, process.env.JWT_SECRET)
                    res.json({ success: true, authToken: authToken })

                } else {
                    res.json({ success: false })
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
})


router.get('/profile', auth, async (req, res) => {
    const userData = await User.findOne({ email: req.user.email })
    if (!userData) {
        res.json({ success: false })
    }
    res.json(userData)
})

router.post('/updateuser', auth, upload.fields([{ name: 'avatar' }, { name: 'licenseFile' }]), async (req, res) => {
    let { name, drivingLicense, nationalId, userType, phoneNumber } = req.body
    const avatar = req.files['avatar'] ? req.files['avatar'][0].filename : 'default.jpg'
    const licenseFile = req.files['licenseFile'] ? req.files['licenseFile'][0].filename : ''

    let user = await User.findOneAndUpdate({ email: req.user.email }, {
        avatar,
        userType,
        name,
        phoneNumber,
        licenseFile,
        drivingLicense,
        nationalId
    })
    return res.json({ success: true })
})

router.delete('/deleteuser', auth, async (req, res) => {
    let vehicle = await Vehicle.deleteMany({ ownerId: req.user.id })
    let user = await User.findOneAndDelete({ email: req.user.email })
    return res.json({ success: true, message: 'User deleted successfully' })
})

router.get('/user', auth, async (req, res) => {
    let user = await User.findOne({ email: req.user.email })
    res.json(user)
})

router.get('/drivers', async (req, res) => {
    try {
        const drivers = await User.find({ userType: 'Driver', isAvailable: true });
        res.json({ success: true, drivers });
    } catch (error) {
        console.log(error);
        res.json({ success: false });
    }
});

router.get('/my-vehicles', auth, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).populate('added_vehicle_id');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, vehicles: user.added_vehicle_id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router