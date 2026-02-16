const PeriodModel = require("../models/period");

const savePeriodDetails = async (req, res) => {
    try {
        const { periodStart, periodEnd, flowIntensity, symptoms, mood, notes } = req.body

        if (!periodStart) {
            return res.status(400).json({
                success: false,
                message: "Period start date is required"
            })
        }

        const entry = await PeriodModel.create({
            periodStart,
            periodEnd: periodEnd || null,
            flowIntensity,
            symptoms,
            mood,
            notes,
            user: req.user._id
        })

        res.status(201).json({
            success: true,
            message: "Period logged successfully",
            entry
        })
    } catch (error) {
        console.error("Error Creating Period Details:", error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const saveUserEntry = async (req, res) => {
    try {
        const { flowIntensity, symptoms, mood, notes } = req.body;
        const userId = req.user._id;

        const today = new Date();

        // 1 Check if the user has an active period (latest one without periodEnd)
        let currentPeriod = await PeriodModel.findOne({
            user: userId,
            periodEnd: { $exists: false } // no end date yet
        }).sort({ createdAt: -1 });

        // 2 If no active period, create one with default periodStart / periodEnd
        if (!currentPeriod) {
            const DEFAULT_PERIOD_LENGTH = 5; // can be customized

            currentPeriod = await PeriodModel.create({
                user: userId,
                flowIntensity,
                periodStart: today,
                periodEnd: new Date(today.getTime() + DEFAULT_PERIOD_LENGTH * 24 * 60 * 60 * 1000),
                symptoms,
                mood,
                notes
            });
        } else {
            // 3 If there is already an active period, just update the flow & other fields
            if (flowIntensity) currentPeriod.flowIntensity = flowIntensity;
            if (symptoms) currentPeriod.symptoms = symptoms;
            if (mood) currentPeriod.mood = mood;
            if (notes) currentPeriod.notes = notes;

            await currentPeriod.save();
        }

        return res.status(200).json({
            status: true,
            message: "Entry saved successfully",
            entry: currentPeriod
        });
    } catch (error) {
        console.log("Error Updating Period Details:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
};


// const saveUserEntry = async (req, res) => {
//     try {
//         const { flowIntensity, symptoms, mood, notes } = req.body;

//         const entry = await PeriodModel.create({
//             flowIntensity,
//             symptoms,
//             mood,
//             notes,
//             user: req.user._id
//         });

//         res.status(200).json({
//             status: true,
//             message: "Entry saved successfully",
//             entry
//         })
//     } catch (error) {
//         console.log("Error Updating Period Details : ", error);
//         res.status(500).json({
//             status: false,
//             message: "Internal Server Error"
//         })
//     }
// }

const getEntry = async (req, res) => {
    try {
        const entries = await PeriodModel.find({ user: req.user._id })
            .sort({ periodStart: -1 })

        res.status(200).json({
            success: true,
            message: "Entries fetched successfully",
            entries
        })

    } catch (error) {
        console.error("Getting Entry Error:", error)
        res.status(500).json({
            success: false,
            message: "Something went wrong, please try again"
        })
    }
}


const endPeriod = async (req, res) => {
    try {
        const { id } = req.params
        const { periodEnd } = req.body
        const userId = req.user.id

        if (!periodEnd) {
            return res.status(400).json({
                status: false,
                message: "periodEnd is required",
            })
        }

        const period = await PeriodModel.findOne({
            _id: id,
            user: userId,
        })

        if (!period) {
            return res.status(404).json({
                status: false,
                message: "Period not found",
            })
        }

        const start = new Date(period.periodStart)
        const end = new Date(periodEnd)

        if (end < start) {
            return res.status(400).json({
                status: false,
                message: "Period end cannot be before start",
            })
        }

      
        const MAX_PERIOD_LENGTH = 10
        const diff =
            (end - start) / (1000 * 60 * 60 * 24) + 1

        if (diff > MAX_PERIOD_LENGTH) {
            return res.status(400).json({
                status: false,
                message: "Period length is unusually long",
            })
        }

        period.periodEnd = end
        await period.save()

        return res.status(200).json({
            status: true,
            message: "Period ended successfully",
            period,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        })
    }
}


module.exports = {
    savePeriodDetails,
    saveUserEntry,
    getEntry,
    endPeriod
}