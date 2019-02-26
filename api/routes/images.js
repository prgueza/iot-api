const express = require('express');
const moment = require('moment');

const router = express.Router();
const multer = require('multer');

/* CONTROLLER */
const ImagesController = require('../controllers/images.js');
const checkAuth = require('../middleware/check-auth');

/* MULTER CONFIGURATIONS */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'img/');
  },
  filename(req, file, cb) {
    cb(null, `${req.params.id + moment()}.bmp`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/bmp') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    filesize: 1024 * 1024 * 5,
  },
  fileFilter,
});

/* API GET */
router.get('/', checkAuth, ImagesController.imagesGetAll);
router.get('/:id', checkAuth, ImagesController.imagesGetOne);

/* API POST */
router.post('/', checkAuth, ImagesController.imageCreate);
router.post('/:id', upload.single('image'), ImagesController.imageUpload);

/* API PUT */
router.put('/:id', checkAuth, ImagesController.imageUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, ImagesController.imageDelete);

module.exports = router;
