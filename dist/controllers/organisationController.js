const db = require('../database/db');
const organisationSchema = require('../schema/organisation');
const yup = require('yup');
const getOrganisations = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is missing"
      });
    }
    const organisations = await db("organisations").select("organisations.orgId", "organisations.name", "organisations.description").join("users_organisation", "organisations.orgId", "users_organisation.orgId").where("users_organisation.userId", userId);
    res.status(200).json({
      status: "success",
      message: "Organisations retrieved successfully",
      data: {
        organisations
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching organisations",
      error: error.message
    });
  }
};
const getOrganisationById = async (req, res) => {
  try {
    const {
      orgId
    } = req.params;
    if (!orgId) {
      return res.status(400).json({
        status: "error",
        message: "Organisation ID is missing"
      });
    }

    // Assuming db is your Knex instance configured for database operations
    const organisation = await db("organisations").where({
      orgId
    }).first();
    if (!organisation) {
      return res.status(404).json({
        status: "error",
        message: "Organisation not found"
      });
    }
    res.status(200).json({
      status: "success",
      message: "Organisation retrieved successfully",
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description
      }
    });
  } catch (error) {
    console.error("Error fetching organisation:", error.message);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the organisation",
      error: error.message
    });
  }
};
const createOrganisation = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.error("User ID is missing from request:", req.user);
      return res.status(400).json({
        status: "Bad Request",
        message: "User ID is missing",
        statusCode: 400
      });
    }
    const {
      name,
      description
    } = req.body;
    await organisationSchema.validate({
      name,
      description
    });

    // Check if the organisation name already exists
    const existingOrganisation = await db("organisations").where("name", name).first();
    if (existingOrganisation) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Organisation name already exists",
        statusCode: 400
      });
    }

    // Insert new organisation into organisations table
    const [newOrganisation] = await db("organisations").insert({
      name,
      description
    }).returning(["orgId", "name", "description"]);
    await db("users_organisation").insert({
      userId,
      orgId: newOrganisation.orgId
    });
    res.status(201).json({
      status: "success",
      message: "Organisation created successfully",
      data: newOrganisation
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        status: "Bad Request",
        message: error.message,
        statusCode: 400
      });
    }
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the organisation",
      error: error.message
    });
  }
};
const addUserToOrganisation = async (req, res) => {
  try {
    const {
      orgId
    } = req.params;
    const {
      userId
    } = req.body;
    const organisation = await db("organisations").where("orgId", orgId).first();
    if (!organisation) {
      return res.status(404).json({
        status: "Not Found",
        message: "Organisation not found",
        statusCode: 404
      });
    }

    // Check if the user exists
    const user = await db("users").where({
      userId
    }).first();
    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        message: "User not found",
        statusCode: 404
      });
    }
    const existingAssociation = await db("users_organisation").where({
      orgId: orgId,
      userId
    }).first();
    if (existingAssociation) {
      return res.status(400).json({
        status: "Bad Request",
        message: "User is already a member of the organisation",
        statusCode: 400
      });
    }
    await db("users_organisation").insert({
      orgId: orgId,
      userId
    });
    res.status(200).json({
      status: "success",
      message: "User added to organisation successfully"
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        status: "Bad Request",
        message: error.message
      });
    }
    res.status(500).json({
      status: "error",
      message: "An error occurred while adding the user to the organisation",
      error: error.message
    });
  }
};
module.exports = {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation
};