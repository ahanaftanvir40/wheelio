import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        enum: ['Car', 'Bike'],
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    pricePerDay: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    availability: {
        type: Boolean
    },
    images: [{
        type: Array,
        required: true,
    }],
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
        },
    }],
    averageRating: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        enum: ['Sedan', 'SUV', 'Sports Car', 'Wagon', 'MiniVan', 'Convertible', 'Commuter Bike', 'Sports Bike', 'Cruiser Bike', 'Scooter'],
        required: true,
    },
    condition: {
        type: String,
        required: true,
    },
    no_plate: {
        type: String,
        required: true
    },
    chassis_no: {
        type: String,
        required: true
    },
    registration_no: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


export const Vehicle = mongoose.model('vehicle', vehicleSchema)


