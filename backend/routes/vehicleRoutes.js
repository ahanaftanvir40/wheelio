import express from 'express'
import { auth } from '../middlewares/auth.js'
import { Vehicle } from '../models/vehicle.models.js';
import { User } from '../models/user.models.js';
import { upload } from '../config/multer-config.js'


const router = express.Router()


router.post('/vehicles', auth, upload.array('vehicleImages', 5), async (req, res) => {
    const {
        description,
        type,
        brand,
        model,
        year,
        pricePerDay,
        location,
        latitude,
        longitude,
        availability,
        category,
        condition,
        no_plate,
        chassis_no,
        registration_no,
    } = req.body;

    try {
        // console.log(req.files);
        const images = req.files.map(file => file.filename);

        const vehicle = await Vehicle.create({
            ownerId: req.user.id,
            description,
            type,
            brand,
            model,
            year,
            pricePerDay,
            location,
            latitude,
            longitude,
            availability,
            images,
            category,
            condition,
            no_plate,
            chassis_no,
            registration_no,
        });

        await vehicle.save();

        const user = await User.findOne({ email: req.user.email });
        user.added_vehicle_id.push(vehicle._id);
        await user.save();

        res.json({ success: true, vehicleId: vehicle.id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

router.get('/vehicles/:vehicleId', auth, async (req, res) => {
    let vehicleData = await Vehicle.findOne({ _id: req.params.vehicleId }).populate('ownerId').populate('ratings.userId', 'name email');
    //console.log(vehicleData);
    res.json(vehicleData)
})

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

router.post('/vehicles-update/:vehicleId', async (req, res) => {
    let { description, type, brand, model, year, pricePerDay, location, category, condition, no_plate, chassis_no, registration_no } = req.body
    let images = req.files['images'] ? req.files['images'].map(file => file.filename) : []
    let vehicle = await Vehicle.findOneAndUpdate({ _id: req.params.vehicleId }, {
        description,
        type,
        brand,
        model,
        year,
        pricePerDay,
        location,
        category,
        condition,
        no_plate,
        chassis_no,
        registration_no
    })
    return res.json({ success: true })
})

router.post('/upload', upload.array('photos', 10), async (req, res) => {
    try {
        const uploadedPhotos = [];

        // Loop through uploaded files and process each
        for (const file of req.files) {
            const photo = new Photo({
                name: file.originalname,
                path: file.path // Adjust path based on your storage strategy
            });

            await photo.save();
            uploadedPhotos.push(photo);
        }

        res.json({ message: 'Photos uploaded successfully!', data: uploadedPhotos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading photos' });
    }
});

//ratings
router.post('/vehicles/:vehicleId/rate', auth, async (req, res) => {
    try {
        let { rating, review } = req.body


        const vehicle = await Vehicle.findById(req.params.vehicleId)

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        if (vehicle.ratings.find(rating => rating.userId.toString() === req.user.id.toString())) {
            return res.status(400).json({ message: 'You have already rated this vehicle', code: 400 })
        }

        const newRating = {
            userId: req.user.id,
            rating,
            review
        }

        vehicle.ratings.push(newRating)

        const totalRatings = vehicle.ratings.length
        const sumRatings = vehicle.ratings.reduce((sum, rating) => sum + rating.rating, 0)

        vehicle.averageRating = sumRatings / totalRatings

        await vehicle.save()

        res.status(201).json({ message: 'Rating added successfully', vehicle })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})


export default router