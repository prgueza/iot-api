const express = require('express');
const router = express.Router();
const { settings } = require('../datos');


/* API GET */
router.get('/', (req, res, next) => {
  res.status(200).json(settings);
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  res.status(200).json(settings[id]);
});


/* API POST */
router.post('/', (req, res, next) => {
  res.status(200).json({ mensaje: 'exito' });
});


/* API PUT */
router.put('/:id', (req, res, next) => {

});


/* API DELETE */
router.delete('/:id', (req, res, next) => {

});

module.exports = router;
