const express = require('express');
const router = express.Router();
const { displays, images, groups } = require('../datos');


/* API GET */
router.get('/', (req, res, next) => {
  const res_json = images.map((i) => ({
    "url":i.url,
    "id":i.id,
    "name":i.name,
    "description":i.description,
    "tags_total":i.tags_total,
    "created_at":i.created_at
  }));
  res.status(200).json(res_json);
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  const image = images.find((i) => i.id == id);
  image ? res.status(200).json(image) : res.status(500).json({ alert: 'No matches found'});
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
