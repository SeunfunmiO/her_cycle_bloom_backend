// const jwt = require('jsonwebtoken');
// const UserModel = require('../models/usersModel');

// const protect = async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//         try {
//             token = req.headers.authorization.split(" ")[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             req.user = await UserModel.findById(decoded.id).select("-password");
//             next();
//         } catch (error) {
//             res.status(401).json({ message: "Not authorized, token failed" });
//         }
//     }

//     if (!token) res.status(401).json({ message: "Not authorized, no token" });
// };


// const adminOnly = (req, res, next) => {
//     if (req.user && req.user.isAdmin) {
//         next();
//     } else {
//         return res.status(403).json({ message: "Access denied: Admins only" });
//     }
// };
// module.exports = { protect, adminOnly }

const jwt = require("jsonwebtoken");
const UserModel = require("../models/usersModel");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await UserModel.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            return next();
        } catch (error) {
            return res
                .status(401)
                .json({ message: "Not authorized, token failed" });
        }
    }

    return res.status(401).json({ message: "Not authorized, no token" });
};

const adminOnly = (req, res, next) => {
    if (req.user?.isAdmin) {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Admins only" });
};

module.exports = { protect, adminOnly };
