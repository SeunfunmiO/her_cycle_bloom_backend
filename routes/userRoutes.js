const express = require('express')
const {
    signUp,
    googleSignup,
    signIn,
    updateProfile,
    enableNotif,
    getUser,
    updateReminderSettings,
    deleteAccount,
    userProfile,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()


router.post('/sign-up', signUp)
router.post('/google-signin', googleSignup)
router.post('/sign-in', signIn)
router.put('/create-profile/:id',updateProfile)
router.get('/user-profile/:id',userProfile)
router.put('/enable-notification/:id',enableNotif)
router.get('/get-user', getUser)
router.put('/set-reminder', protect, updateReminderSettings)
router.put('/delete-account/:id', protect, deleteAccount)






module.exports = router