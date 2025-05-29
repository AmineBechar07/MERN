const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// GET /api/check-evaluation-status
// Checks if exactly two evaluation reports exist for a given page and cancer type.
// Query params:
// - pageNumber: The 'id_report' of the evaluation.
// - cancerType: The 'type_of_report' for the evaluation.
router.get('/', async (req, res) => {
    const { pageNumber, cancerType } = req.query;

    if (!pageNumber || !cancerType) {
        return res.status(400).json({ message: 'Missing pageNumber or cancerType query parameters.' });
    }

    try {
        const numericPageNumber = parseInt(pageNumber, 10);
        if (isNaN(numericPageNumber) || numericPageNumber <= 0) {
            return res.status(400).json({ message: 'pageNumber must be a positive integer.' });
        }

        const count = await Evaluation.countDocuments({
            id_report: numericPageNumber,
            type_of_report: cancerType
        });

        // According to the requirement: "if there is two report it means both are selected and return true otherwise false"
        const isComplete = count === 2;

        res.json({ pageNumber: numericPageNumber, cancerType, count, isComplete });

    } catch (error) {
        console.error(`Error checking evaluation status for page ${pageNumber}, type ${cancerType}:`, error);
        res.status(500).json({ message: 'Server error while checking evaluation status.' });
    }
});

module.exports = router;
