const express = require('express');
const moment = require('moment');
const router = express.Router();
const multer = require('multer');

/* CONTROLLER */
const ImagesController = require('../controllers/images.js');

/* MULTER CONFIGURATIONS */
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'img/');
  },
  filename: function(req, file, cb){
    cb(null, req.params.id + moment() + '.png');
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    filesize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

/* API GET */
router.get('/', ImagesController.images_get_all);
router.get('/:id', ImagesController.images_get_one);

/* API POST */
router.post('/', ImagesController.image_create);
router.post('/:id', upload.single('image'), ImagesController.image_upload);

/* API PUT */
router.put('/:id', ImagesController.image_update);

/* API DELETE */
router.delete('/:id', ImagesController.image_delete);

module.exports = router;
