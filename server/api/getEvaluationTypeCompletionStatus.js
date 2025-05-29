const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// GET /api/evaluation-type-completion-status
// Checks if all pages for a given cancer type have complete evaluations.
// Query params:
// - cancerType: The 'type_of_report' for the evaluation.
// - totalPages: The total number of pages for this cancerType.
router.get('/', async (req, res) => {
    const { cancerType, totalPages } = req.query;

    if (!cancerType || !totalPages) {
        return res.status(400).json({ message: 'Missing cancerType or totalPages query parameters.' });
    }

    const numTotalPages = parseInt(totalPages, 10);
    if (isNaN(numTotalPages) || numTotalPages <= 0) {
        return res.status(400).json({ message: 'totalPages must be a positive integer.' });
    }

    try {
        // Count all Evaluation documents for the given cancerType where all_criteria_met is true.
        const countOfCompletedEvaluations = await Evaluation.countDocuments({
            type_of_report: cancerType,
            all_criteria_met: true 
        });

        // A type is considered fully complete if the number of completed evaluations 
        // (where all_criteria_met is true) is equal to totalPages * 2 (for mistral and deepseek).
        const allPagesComplete = countOfCompletedEvaluations === (numTotalPages * 2);
        
        // Additionally, ensure there are no pages with partial (non-complete) evaluations if we want to be strict.
        // However, the user's primary logic is based on the count of *completed* evaluations.
        // If numTotalPages is 0, and countOfCompletedEvaluations is 0, it should be considered complete (or handled by client).
        // For safety, if numTotalPages is 0, it cannot be "complete" in the sense of having filled evaluations.
        const effectivelyComplete = (numTotalPages > 0) && allPagesComplete;

        // Get the total count of all evaluation documents submitted for this type
        const totalEvaluationsSubmittedForType = await Evaluation.countDocuments({
            type_of_report: cancerType
        });

        res.json({ 
            cancerType, 
            totalPages: numTotalPages, 
            allPagesComplete: effectivelyComplete, 
            completedEvaluationCount: countOfCompletedEvaluations, // Renamed from debug_
            totalEvaluationsSubmitted: totalEvaluationsSubmittedForType
        });

    } catch (error) {
        console.error(`Error checking completion status for type ${cancerType}:`, error);
        res.status(500).json({ message: 'Server error while checking evaluation type completion status.' });
    }
});

module.exports = router;
