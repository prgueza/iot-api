const mongoose = require('mongoose');

/* DATA MODELS */
const Gateway = require('../models/gateway');

/* GET ALL */
exports.gatewaysGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const gateways = await Gateway.find()
        .select('_id url sync name ip mac port description createdAt updatedAt')
        .exec();
      res.status(200).json(gateways);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.gatewaysGetOne = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const _id = req.params.id;
      const gateway = await Gateway.findById(_id)
        .select('_id url name description ip mac port createdBy createdAt updatedAt')
        .populate('createdBy', '_id url name')
        .populate('updated_by', '_id url name')
        .populate('location', '_id url name')
        .exec();
      if (gateway) {
        res.status(200).json(gateway);
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.gatewayCreate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const {
        name, description, location, createdBy, mac, ip, port,
      } = req.body;
      const _id = new mongoose.Types.ObjectId();
      const gateway = new Gateway({
        _id,
        name,
        description,
        location,
        createdBy,
        mac,
        ip,
        port,
        url: `${process.env.API_URL}gateways/${_id}`,
        sync: `http://${ip}:${port}/devices`, // TODO: remove this
      });
      const newGateway = await gateway.save().populate('_ud url name description createdAt updatedAt');
      res.status(201).json({
        message: 'Success at adding a new gateway to the collection',
        success: true,
        resourceId: _id,
        resource: newGateway,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.gatewayUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const _id = req.params.id; // TODO: sync url should be generated with the update controller
      if (req.body.port || req.body.ip) { req.body.sync = `http://${req.body.ip}:${req.body.port}/devices`; }
      const gateway = await Gateway.findOneAndUpdate({ _id }, { $set: req.body }, { new: true });
      if (gateway) {
        res.status(200).json({
          message: 'Success at adding a new display to the collection',
          notify: `${gateway.name} actualizada`,
          success: true,
          resourceId: _id,
          resource: gateway,
        });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.gatewayDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const _id = req.params.id;
      const gateway = await Gateway.findByIdAndDelete(_id);
      if (gateway) {
        res.status(200).json({
          message: 'Success at removing a gateway from the collection',
          success: true,
          resourceId: _id,
        });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};
