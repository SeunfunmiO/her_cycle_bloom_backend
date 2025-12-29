const express = require('express')
const {
    savePeriodDetails,
    saveUserEntry,
    getEntry
} = require('../controllers/periodContoller')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()


router.post('/create-period-details', protect, savePeriodDetails)
router.put('/save-entry', protect, saveUserEntry)
router.get('/get-entry', protect, getEntry)


module.exports = router