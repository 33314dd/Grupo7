const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// 💖 Toggle favorito (agregar/quitar)
router.post('/toggle/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Verificar si ya existe
    const existingFavorite = await Favorite.findOne({ userId, eventId });

    if (existingFavorite) {
      // ❌ Quitar de favoritos
      await Favorite.deleteOne({ userId, eventId });
      res.json({ 
        message: 'Evento removido de favoritos', 
        isFavorite: false 
      });
    } else {
      // ✅ Agregar a favoritos
      const favorite = new Favorite({ userId, eventId });
      await favorite.save();
      res.json({ 
        message: 'Evento agregado a favoritos', 
        isFavorite: true 
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: error.message });
  }
});

// 📋 Obtener todos los favoritos del usuario
router.get('/my-favorites', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'eventId',
        model: 'Event',
        populate: {
          path: 'createdBy',
          model: 'User',
          select: 'username email'
        }
      })
      .sort({ createdAt: -1 });

    const favoriteEvents = favorites
      .filter(fav => fav.eventId)
      .map(fav => ({
        ...fav.eventId.toObject(),
        isFavorite: true,
        favoriteDate: fav.createdAt
      }));

    res.json(favoriteEvents);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Verificar si un evento es favorito
router.get('/check/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({ userId, eventId });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;