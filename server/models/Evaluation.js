const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    id_report: { // This will represent the page number
        type: Number,
        required: true,
    },
    model_name: { // e.g., "mistral", "deepseek"
        type: String,
        required: true,
        enum: ['mistral', 'deepseek', 'other'] // You can expand this list
    },
    type_of_report: {
        type: String,
        required: true,
    },
    criteria_1_rating: { type: Number, default: 0, min: 0, max: 5 }, // Rating from 0-5 (0 means not rated)
    criteria_2_rating: { type: Number, default: 0, min: 0, max: 5 },
    criteria_3_rating: { type: Number, default: 0, min: 0, max: 5 },
    all_criteria_met: { // True if all 3 criteria have a rating > 0
        type: Boolean,
        default: false
    },
    userId: { // To associate the evaluation with a user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true // Uncomment if every evaluation must be tied to a logged-in user
    },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Middleware to automatically update `all_criteria_met` before saving
evaluationSchema.pre('save', function(next) {
    // A criterion is considered "met" if it has a rating greater than 0.
    // All criteria are met if all three ratings are greater than 0.
    this.all_criteria_met = (this.criteria_1_rating > 0) &&
                            (this.criteria_2_rating > 0) &&
                            (this.criteria_3_rating > 0);
    next();
});

// To prevent duplicate entries for the same user, page, model, and report type.
// Adjust this index based on your exact uniqueness requirements.
evaluationSchema.index({ userId: 1, id_report: 1, model_name: 1, type_of_report: 1 }, { unique: true });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
