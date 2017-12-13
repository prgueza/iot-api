const express = require('express');
const router = express.Router();
const { displays, groups, images } = require('../datos');


/* API GET */
router.get('/', (req, res, next) => {
  const res_json = displays.map((d) => ({
    "url":d.url,
    "id":d.id,
    "name":d.name,
    "description":d.description,
    "tags_total":d.tags_total,
    "created_at":d.created_at
  }));
  setTimeout(() => { res.status(200).json(res_json) }, 1000);
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  const display = displays.find((d) => d.id == id);
  display ? res.status(200).json(display) : res.status(500).json({ alert: 'No matches found'});
});


/* API POST */
router.post('/', (req, res, next) => {
  const { id, name, description, location, user, image_id, group_id, tags, created_at, updated_at, dimensions } = req.body;
  const group = groups.find((g) => g.id == group_id);
  const image = images.find((i) => i.id == image_id);
  const display = {
    url: "https://localhost:3000/api/displays/" + id,
    id: id,
    name: name,
    description: description,
    location: location,
    created_at: created_at,
    updated_at: updated_at,
    user: user,
    dimensions: dimensions,
    groups: [{
      "url":'',
      "id":group.id,
      "name":group.name
    }],
    images: [{
      "url":image.url,
      "id":image.id,
      "name":image.name,
      "src_url":image.src_url
    }],
    active_image: {
      "url":image.url,
      "id":image.id,
      "name":image.name,
      "src_url":image.src_url
    },
    dimensions: {
      width: 250,
      height: 250
    },
    tags_total: tags.length,
    tags: tags
  };
  displays.push(display);
  res.json({ mensaje: 'exito' });
});


/* API PUT */
router.put('/:id', (req, res, next) => {

});


/* API DELETE */
router.delete('/:id', (req, res, next) => {

});

module.exports = router;
