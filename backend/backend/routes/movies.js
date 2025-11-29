const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// middleware para verificar JWT
function auth(requiredAdmin = false) {
  return (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret_jwt');
      if (requiredAdmin && !payload.isAdmin) return res.status(403).json({ error: 'Se requiere rol administrador' });
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
}

// GET all (público)
router.get('/', async (req, res) => {
  const q = req.query.q;
  const filter = q ? { $or: [{ title: { $regex: q, $options: 'i' } }, { genre: { $regex: q, $options: 'i' } }] } : {};
  const movies = await Movie.find(filter).sort({ createdAt: -1 });
  res.json(movies);
});

// GET one
router.get('/:id', async (req, res) => {
  const m = await Movie.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'No encontrado' });
  res.json(m);
});

// CREATE (admin)
router.post('/', auth(true), upload.single('imageFile'), async (req, res) => {
  try {
    const { title, year, director, genre, synopsis, imageUrl } = req.body;
    let image = imageUrl || null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    const mv = new Movie({ title, year: year ? Number(year) : undefined, director, genre, synopsis, image });
    await mv.save();
    res.json({ success: true, movie: mv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar' });
  }
});

// UPDATE (admin)
router.put('/:id', auth(true), upload.single('imageFile'), async (req, res) => {
  try {
    const { title, year, director, genre, synopsis, imageUrl } = req.body;
    const update = { title, year: year ? Number(year) : undefined, director, genre, synopsis };
    if (req.file) update.image = `/uploads/${req.file.filename}`;
    else if (imageUrl) update.image = imageUrl;
    const m = await Movie.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!m) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true, movie: m });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// DELETE (admin)
router.delete('/:id', auth(true), async (req, res) => {
  try {
    const m = await Movie.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
