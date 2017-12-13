const express = require('express');
const router = express.Router();
const { displays, images, groups } = require('../datos');


/* API GET */
router.get('/', (req, res, next) => {
  const res_json = groups.map((g) => ({
    "url":g.url,
    "id":g.id,
    "name":g.name,
    "description":g.description,
    "tags_total":g.tags_total,
    "created_at":g.created_at
  }));
  res.status(200).json(res_json);
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  const group = groups.find((g) => g.id == id);
  group ? res.status(200).json(group) : res.status(500).json({ alert: 'No matches found'});
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
