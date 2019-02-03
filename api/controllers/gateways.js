/* DATA MODELS */
const Gateway = require('../models/gateway');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL */
exports.gatewaysGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const gateways = await Gateway.find()
        .select(SELECTION.gateways.short)
        .exec();
      res.status(200).json(gateways);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE */
exports.gatewaysGetOne = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const _id = req.params.id;
      const gateway = await Gateway.findById(_id)
        .select(SELECTION.gateways.long)
        .populate('createdBy', SELECTION.users.populate)
        .populate('updated_by', SELECTION.users.populate)
        .populate('location', SELECTION.locations.populate)
        .exec();
      if (gateway) {
        res.status(200).json(gateway);
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* POST */
exports.gatewayCreate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const { body } = req;
      const gateway = new Gateway(body);
      const { _id } = await gateway.save();
      const newGateway = await Gateway.findById(_id).select(SELECTION.gateways.short);
      res.status(201).json({
        message: 'Success at adding a new gateway to the collection',
        notify: `${newGateway.name} configurada`,
        success: true,
        resourceId: newGateway._id,
        resource: newGateway,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* PUT */
exports.gatewayUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const _id = req.params.id;
      if (req.body.port || req.body.ip) { req.body.sync = `http://${req.body.ip}:${req.body.port}/devices`; }
      const gateway = await Gateway.findOneAndUpdate({ _id }, { $set: req.body }, { new: true }).select(SELECTION.gateways.short);
      if (gateway) {
        res.status(200).json({
          message: 'Success at updating a Gateway from the collection',
          notify: `${gateway.name} actualizada`,
          success: true,
          resourceId: _id,
          resource: gateway,
        });
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* DELETE */
exports.gatewayDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const { id } = req.params;
      const gateway = await Gateway.findById(id);
      await gateway.remove();
      if (gateway) {
        res.status(200).json({
          message: 'Success at removing a gateway from the collection',
          notify: `${gateway.name} eliminada`,
          success: true,
          resourceId: id,
        });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};
