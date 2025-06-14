const mongoose = require('mongoose');

const InvasiveStageBiomistralSchema = new mongoose.Schema({
  columnName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { collection: 'invasive-stage-biomistral' });

module.exports = mongoose.model('InvasiveStageBiomistral', InvasiveStageBiomistralSchema);
