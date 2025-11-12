import express from "express";
import { auth } from "../middlewares/auth.js";
import { AdminAuth } from "../middlewares/admin-auth.js";
import { User } from "../models/user.models.js";
import { Vehicle } from '../models/vehicle.models.js';
import { Booking } from '../models/booking.model.js';
const router = express.Router()

// router.get('/allusers', auth, AdminAuth, async (req, res) => {
//     let allUser = await User.find()
//     res.json(allUser)
// })

router.get('/allusers', async (req, res) => {
    const { search } = req.query;

    const searchTerms = search ? search.split(' ').map((term) => new RegExp(term, 'i')) : [];

    try {
        let userData;

        if (searchTerms.length > 0) {
            userData = await User.find({
                $or: [
                    { name: { $in: searchTerms } },
                    { email: { $in: searchTerms } },
                    { userType: { $in: searchTerms } },
                    { isAvailable: { $in: searchTerms } }
                ]
            }).select('-password');
        } else {
            userData = await User.find({}).select('-password');
        }

        res.json(userData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/allvehicles', async (req, res) => {

    const { search } = req.query || ''
    const searchTerms = search.split(' ').map((term) => new RegExp(term, 'i'))

    //console.log(searchTerms);

    try {


        let vehicleData = await Vehicle.find({
            $and: searchTerms.map(term => ({
                $or: [
                    { brand: term },
                    { model: term },
                    { category: term },
                    { location: term }

                ]
            }))

        })
        return res.json(vehicleData)

    } catch (error) {
        console.log(error);
    }

})


router.get('/allbookings', async (req, res) => {
    const { search } = req.query;

    const searchTerms = search ? search.split(' ').map((term) => new RegExp(term, 'i')) : [];

    try {
        let bookingData;

        if (searchTerms.length > 0) {
            bookingData = await Booking.find({
                $or: [
                    { status: { $in: searchTerms } },
                    { vehicleId: { $in: searchTerms } },
                    { driverId: { $in: searchTerms } },
                    { bookingStart: { $in: searchTerms } },
                    { bookingEnd: { $in: searchTerms } },
                ]
            });
        } else {
            bookingData = await Booking.find({});
        }

        res.json(bookingData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router