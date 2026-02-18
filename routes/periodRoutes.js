const express = require('express')
const {
    savePeriodDetails,
    saveUserEntry,
    getEntries,
    endPeriod,
    getSingleEntry
} = require('../controllers/periodContoller')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()


router.post('/create-period-details', protect, savePeriodDetails)
router.put('/save-entry', protect, saveUserEntry)
router.get('/get-entry/:id', protect, getSingleEntry)
router.get('/get-entries', protect, getEntries)
router.patch("/period/:id/end", protect, endPeriod)



module.exports = router