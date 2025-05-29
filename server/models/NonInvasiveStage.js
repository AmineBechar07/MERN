const mongoose = require('mongoose');

const NonInvasiveStageSchema = new mongoose.Schema({
  columnName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { collection: 'non-invasive-stage-mistral' });

module.exports = mongoose.model('NonInvasiveStage', NonInvasiveStageSchema);
