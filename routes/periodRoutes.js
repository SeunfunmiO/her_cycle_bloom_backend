const express = require('express')
const {
    savePeriodDetails,
    saveUserEntry,
    getEntry,
    endPeriod
} = require('../controllers/periodContoller')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()


router.post('/create-period-details', protect, savePeriodDetails)
router.put('/save-entry', protect, saveUserEntry)
router.get('/get-entry', protect, getEntry)
router.patch("/period/:id/end", protect, endPeriod)



module.exports = router