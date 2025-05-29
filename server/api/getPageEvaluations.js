const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// GET /api/get-page-evaluations
// Fetches existing evaluations for a specific page (id_report) and cancer type (type_of_report)
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

        // Fetch evaluations for both models for the given page and type
        const evaluations = await Evaluation.find({
            id_report: numericPageNumber,
            type_of_report: cancerType,
            model_name: { $in: ['mistral', 'deepseek'] }
        }).select('model_name criteria_1_rating criteria_2_rating criteria_3_rating'); // Select only needed fields

        const results = {
            mistral: null,
            deepseek: null
        };

        evaluations.forEach(ev => {
            if (ev.model_name === 'mistral') {
                results.mistral = {
                    criteria_1_rating: ev.criteria_1_rating,
                    criteria_2_rating: ev.criteria_2_rating,
                    criteria_3_rating: ev.criteria_3_rating,
                };
            } else if (ev.model_name === 'deepseek') {
                results.deepseek = {
                    criteria_1_rating: ev.criteria_1_rating,
                    criteria_2_rating: ev.criteria_2_rating,
                    criteria_3_rating: ev.criteria_3_rating,
                };
            }
        });

        res.json({ pageNumber: numericPageNumber, cancerType, evaluations: results });

    } catch (error) {
        console.error(`Error fetching evaluations for page ${pageNumber}, type ${cancerType}:`, error);
        res.status(500).json({ message: 'Server error while fetching page evaluations.' });
    }
});

module.exports = router;
