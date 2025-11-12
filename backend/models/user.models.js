import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    added_vehicle_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'vehicle',
            required: true
        }
    ],
    avatar: {
        type: String,
        default: 'default.jpg'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ['Normal', 'Driver'],
        required: true
    },
    isAvailable: {
        type: Boolean,
        required: function () { return this.userType === 'Driver' },
        default: true
    },

    phoneNumber: {
        type: String,
        required: true
    },
    drivingLicense: {
        type: String,
        required: function () { return this.userType === 'Driver' }
    },
    licenseFile: {
        type: String,
        required: function () { return this.userType === 'Driver' }
    },
    nationalId: {
        type: String,
        required: function () { return this.userType === 'Driver' }
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
    }],
    



}, { timestamps: true })

export const User = mongoose.model('user', userSchema)