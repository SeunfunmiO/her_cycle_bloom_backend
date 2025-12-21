const mongoose = require('mongoose')


const PeriodSchema = new mongoose.Schema({
    periodStart: {
        type: Date,
        default: null
    },
    periodEnd: {
        type: Date,
        default: null
    },
    flowIntensity: {
        type: String,
        default: null
    },
    symptoms: {
        type: [String],
        default:[]
    },
    mood: {
        type: [String],
        default: []
    },
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true })

const PeriodModel = mongoose.model('Period', PeriodSchema)

module.exports = PeriodModel