const shippingModel = require("../models/shippingModel");

// Get all shipping zones
exports.getShippingSettings = (req, res) => {
  shippingModel.getShippingSettings((err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch shipping settings",
        error: err,
      });
    }

    res.status(200).json(results);
  });
};

// Create shipping zone
exports.createShippingZone = (req, res) => {
  shippingModel.createShippingZone(req.body, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to create shipping zone",
        error: err,
      });
    }

    res.status(201).json({
      message: "Shipping zone created successfully",
      id: result.insertId,
    });
  });
};

// Update shipping zone
exports.updateShippingZone = (req, res) => {
  const { id } = req.params;

  shippingModel.updateShippingZone(id, req.body, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to update shipping zone",
        error: err,
      });
    }

    res.status(200).json({
      message: "Shipping zone updated successfully",
    });
  });
};

// Delete shipping zone
exports.deleteShippingZone = (req, res) => {
  const { id } = req.params;

  shippingModel.deleteShippingZone(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete shipping zone",
        error: err,
      });
    }

    res.status(200).json({
      message: "Shipping zone deleted successfully",
    });
  });
};