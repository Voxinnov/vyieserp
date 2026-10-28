const db = require("../models");
const Organization = db.organization;
const User = db.user;
const Role = db.role;
const bcrypt = require("bcryptjs");

// Get Organization Details
exports.getOrganization = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        if (!organizationId) {
            return res.status(403).send({ message: "No organization associated with this user." });
        }
        const org = await Organization.findByPk(organizationId);
        res.status(200).send(org);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update Organization Details
exports.updateOrganization = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        await Organization.update(req.body, { where: { id: organizationId } });
        res.status(200).send({ message: "Organization updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- Team Management ---

// List Users in Organization
exports.getTeam = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        const users = await User.findAll({
            where: { organization_id: organizationId },
            include: [{ model: Role, as: 'custom_role' }]
        });
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Add User to Organization
exports.addUserToTeam = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            mobile: req.body.mobile,
            role: req.body.role || 'staff',
            organization_id: organizationId,
            role_id: req.body.role_id
        });
        res.status(201).send({ message: "User added to team successfully!", userId: user.id });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- Role Management ---

// Create Custom Role
exports.createRole = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        const role = await Role.create({
            name: req.body.name,
            permissions: req.body.permissions,
            organization_id: organizationId
        });
        res.status(201).send(role);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// List Org Roles
exports.getRoles = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        const roles = await Role.findAll({ where: { organization_id: organizationId } });
        res.status(200).send(roles);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update Role
exports.updateRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const organizationId = req.organizationId;
        await Role.update(req.body, {
            where: { id: roleId, organization_id: organizationId }
        });
        res.status(200).send({ message: "Role updated successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
