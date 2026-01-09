const UserModel = require("../models/usersModel")
const bcrypt = require('bcryptjs')
const generateToken = require("../utils/generateToken")
const cloudinary = require("../config/cloudinary")
const crypto = require("crypto")
const {
    sendWelcomeMail,
    sendResetPasswordEmail
} = require('../lib/nodemailer.js')
const otpGenerator = require("otp-generator")


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

            await sendWelcomeMail(user.name, user.email);
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
        const existingUser = await UserModel.findOne({ email })
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

        console.log("email", email, "password", password);
        console.log("email", user.email, "password", user.password);
        

        sendWelcomeMail(user.email).catch(err =>
            console.error("Welcome mail error:", err)
        );

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
            token: generateToken(user._id),
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
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { name, email, address, profilePicture, dateOfBirth, cycleLength, lastPeriodDate } = req.body;

        let uploadedImage;

        if (profilePicture) {
            uploadedImage = await cloudinary.uploader.upload(profilePicture, {
                folder: "hercyclebloom/users"
            })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, {
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
            success: true,
            message: "Profile created successfully",
            user: updatedUser
        })
    } catch (error) {
        console.log("Update Profile Error : ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

const userProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await UserModel.findById(req.user._id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const userData = {
            cycleLength: user.cycleLength,
            lastPeriodDate: user.lastPeriodDate
        }

        res.status(200).json({
            success: true,
            message: "User profile fetched",
            userData
        })

    } catch (error) {
        console.log("Fetching User Profile Error : ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

const enableNotif = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await UserModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isNotification = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Notification enabled",
            user
        });

    } catch (error) {
        console.error("Enable notification error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, please try again",
            error: error.message
        });
    }
};

const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                id: req.user._id,
                name: req.user.name,
                address: req.user.address,
                profilePicture: req.user.profilePicture,
                email: req.user.email,
                dateOfBirth: req.user.dateOfBirth,
                isNotification: req.user.isNotification,
                cycleLength: req.user.cycleLength,
                lastPeriodDate: req.user.lastPeriodDate
            }
        });

    } catch (error) {
        console.error("Getting User Error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, please try again"
        });
    }
};


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
                success: false,
                message: "No user found"
            })
        }

        res.status(200).json({
            success: true,
            message: 'Reminder settings updated',
            settings: user.periodSettings
        })
    } catch (error) {
        console.log("Error updating period settings : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const deleteAccount = async (req, res) => {
    try {
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await UserModel.findByIdAndDelete(req.user._id)

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Something went wrong , try again"
            })
        }

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        })

    } catch (error) {
        console.log("Error Deleting Account  : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { id } = req.user
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new password",
            })
        }

        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            })
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password)
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from old password",
            })
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        user.passwordChangedAt = Date.now()
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        })
    } catch (error) {
        console.error("Error changing password:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/verify-otp/${resetToken}`;

        await sendResetPasswordEmail({ email: user.email, name: user.name, resetLink, otp });

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email. Verify to reset password.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { token } = req.params;
        const { otp } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetOtp: otp,
            resetOtpExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        user.isOtpVerified = true;
        await user.save();

        return res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) return res.status(400).json({ success: false, message: "New password is required" });

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await UserModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
            isOtpVerified: true,
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token/OTP" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        user.isOtpVerified = false;
        user.passwordChangedAt = Date.now();

        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Internal server error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = {
    signUp,
    googleSignup,
    signIn,
    updateProfile,
    userProfile,
    enableNotif,
    getUser,
    updateReminderSettings,
    deleteAccount,
    changePassword,
    forgotPassword,
    verifyOtp,
    resetPassword
}