const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: function () {
            return !this.googleId
        },
        type: String,
        select: false
    },
    newPassword: {
        // required: function () {
        //     return !this.googleId
        // },
        type: String,
        select: false
    },
    googleId: {
        type: String,
        defaut: null
    },
    name: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    photo: String,
    dateOfBirth: {
        type: Date,
        default: null
    },
    cycleLength: {
        type: Number,
        default: null
    },
    lastPeriodDate: {
        type: String,
        default: null
    },
    profilePicture: {
        type: String,
        default: null
    },
    isNotification: {
        type: Boolean,
        default: false
    },
    periodSettings: {
        reminderTime: {
            hour: String,
            minute: String,
            second: String,
            period: String
        },
        reminderEnabled: {
            type: Boolean, default: true
        },
        remainderTypes: {
            periodStartAlarm: {
                type: Boolean,
                defalut: true
            },
            periodEndAlarm: {
                type: Boolean,
                defalut: true
            },
            ovulationAlarm: {
                type: Boolean,
                defalut: true
            },
            symptomsAlarm: {
                type: Boolean,
                defalut: true
            }
        },
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
        default: Date.now
    },
    resetOtp: {
        type: String,
    },
    resetOtpExpires: {
        type: Date,
        default: Date.now
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

const UserModel = mongoose.model('user', userSchema)

module.exports = UserModel