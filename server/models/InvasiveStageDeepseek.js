const mongoose = require('mongoose');

const InvasiveStageDeepseekSchema = new mongoose.Schema({
  columnName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { collection: 'invasive-stage-deepseek' });

module.exports = mongoose.model('InvasiveStageDeepseek', InvasiveStageDeepseekSchema);
