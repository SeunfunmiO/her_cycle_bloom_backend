const UserModel = require("../models/usersModel")
const bcrypt = require('bcryptjs')
const generateToken = require("../utils/generateToken")
const sendWelcomeMail = require("../lib/nodemailer")
const cloudinary = require("../config/cloudinary")

const googleSignup = async (req, res) => {
    try {
        const { email, name, photo, uid } = req.body;

        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({
                email,
                name,
                googleId: uid,
                photo
            });

            await sendWelcomeMail(user.name,user.email);
        }

        res.status(200).json({
            success: true,
            message: "Google user saved successfully",
            user
        });
    } catch (error) {
        console.log("Google Signup Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const signUp = async (req, res) => {
    const { email, password } = req.body

    try {
        const existingUser = await UserModel.findOne({ email }).select("+password")
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already in use"
            })
        }

        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await UserModel.create({
            email,
            password: hashedPassword,
        })

        await sendWelcomeMail(user.email)

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user._id,
                email: user.email
            },
            token: generateToken(user._id),
        })

    } catch (error) {
        console.log("Signup Error : ", error);
        res.status(500).json({
            success: false,
            message: "Error creating account"
        })

    }
}

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        res.status(200).json({
            success: true,
            message: "Signed in successfully",
            user: {
                id: user._id,
                email: user.email,
            },
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email, address, profilePicture, dateOfBirth, cycleLength, lastPeriodDate } = req.body;

        let uploadedImage;

        if (profilePicture) {
            uploadedImage = await cloudinary.uploader.upload(profilePicture, {
                folder: "hercyclebloom/users"
            })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, {
            name,
            email,
            address,
            profilePicture: uploadedImage?.secure_url,
            dateOfBirth,
            cycleLength,
            lastPeriodDate
        },
            { new: true }
        )

        res.status(200).json({
            status: true,
            message: "Profile created successfully",
            user: updatedUser
        })
    } catch (error) {
        console.log("update Profile Error : ", error);
        res.status(500).json({
            status: false,
            message: "Server error"
        })
    }
}

const enableNotif = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        user.isNotification = true;
        await user.save();

        res.status(200).json({
            status: true,
            message: "Notification enabled",
            user
        });

    } catch (error) {
        console.error("Enable notification error:", error);
        res.status(500).json({
            status: false,
            message: "Something went wrong, please try again",
            error: error.message
        });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id)

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Signed in successfully",
            user: {
                id: user._id,
                name: user.name,
                address: user.address,
                profilePicture: user.profilePicture,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                isNotification: user.isNotification,
                cycleLength: user.cycleLength,
                lastPeriodDate: user.lastPeriodDate

            }
        })
    } catch (error) {
        console.error("Getting User Error :", error);
        res.status(500).json({
            status: false,
            message: "Something went wrong, please try again",
            error: error.message
        });
    }
}

const updateReminderSettings = async (req, res) => {
    try {
        const id = req.user._id
        const { reminderTime, reminderTypes, reminderEnabled } = req.body;

        const user = await UserModel.findByIdAndUpdate(id, {
            periodSettings: {
                reminderEnabled,
                reminderTime,
                reminderTypes
            }
        },
            { new: true }
        )

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "No user found"
            })
        }

        res.status(200).json({
            status: true,
            message: 'Reminder settings updated',
            settings: user.periodSettings
        })
    } catch (error) {
        console.log("Error updating period settings : ", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
}

const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findByIdAndDelete(id)

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Something went wrong , try again"
            })
        }

        res.status(200).json({
            status: true,
            message: "Account deleted successfully"
        })

    } catch (error) {
        console.log("Error Deleting Account  : ", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
}
module.exports = {
    signUp,
    googleSignup,
    signIn,
    updateProfile,
    enableNotif,
    getUser,
    updateReminderSettings,
    deleteAccount
}