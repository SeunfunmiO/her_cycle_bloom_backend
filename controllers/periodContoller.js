const PeriodModel = require("../models/period");

const savePeriodDetails = async (req, res) => {
    try {
        const { periodStart, periodEnd, flowIntensity, symptoms, mood, notes } = req.body

        const createPeriodDetails = await PeriodModel.create({
            periodStart,
            periodEnd,
            flowIntensity,
            symptoms,
            mood,
            notes,
            user: req.user._id
        })

        res.status(200).json({
            status: true,
            message: "Details created",
            createPeriodDetails: {
                id: createPeriodDetails._id,
                periodStart: createPeriodDetails.periodStart,
                periodEnd: createPeriodDetails.periodEnd,
                flowIntensity: createPeriodDetails.flowIntensity,
                symptoms: createPeriodDetails.symptoms,
                mood: createPeriodDetails.mood,
                notes: createPeriodDetails.notes
            }
        })
    } catch (error) {
        console.log("Error Creating Period Details : ", error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error"
        })
    }

}

const saveUserEntry = async (req, res) => {
    try {
        const { flowIntensity, symptoms, mood, notes } = req.body;

        const entry = await PeriodModel.create({
            flowIntensity,
            symptoms,
            mood,
            notes,
            user: req.user._id
        });

        res.status(200).json({
            status: true,
            message: "Entry saved successfully",
            entry
        })
    } catch (error) {
        console.log("Error Updating Period Details : ", error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error"
        })
    }
}

const getEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await PeriodModel.findById(id)

        if (!entry) {
            return res.status(404).json({
                status: false,
                message: "No entry found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Entry fetched",
            entry: {
                id: req.user._id,
                periodStart: entry.periodStart,
                periodEnd: entry.periodEnd,
                flowIntensity: entry.flowIntensity,
                symptoms: entry.symptoms,
                mood: entry.mood,
                notes: entry.notes,
            }
        })
    } catch (error) {
        console.error("Getting Entry Error :", error);
        res.status(500).json({
            status: false,
            message: "Something went wrong, please try again",
            error: error.message
        });
    }
}

module.exports = {
    savePeriodDetails,
    saveUserEntry,
    getEntry
}