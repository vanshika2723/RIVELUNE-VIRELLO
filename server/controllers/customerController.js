
const {
  getAllCustomers,
  getCustomerById,
} = require("../models/customerModel");

// ========================================
// GET ALL CUSTOMERS
// ========================================
const getAllCustomersController = async (req, res) => {
  try {
    const customers = await getAllCustomers();

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Admin customers fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers.",
    });
  }
};

// ========================================
// GET CUSTOMER DETAILS
// ========================================
const getCustomerByIdController = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer details fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer details.",
    });
  }
};

module.exports = {
  getAllCustomersController,
  getCustomerByIdController,
};
