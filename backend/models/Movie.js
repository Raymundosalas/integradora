const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number },
  director: { type: String },
  genre: { type: String },
  synopsis: { type: String },
  // image puede ser URL externa o ruta /uploads/nombre
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
