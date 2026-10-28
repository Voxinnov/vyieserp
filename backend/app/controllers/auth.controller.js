const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
    try {
        let organizationId = null;
        let roleId = null;

        if (req.body.role === 'organization') {
            const org = await db.organization.create({
                name: req.body.office_name || req.body.organizationName || req.body.username,
                email: req.body.email,
                mobile: req.body.mobile,
                number_of_users: req.body.number_of_users,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                pincode: req.body.pincode,
                logo: req.body.logo
            });
            organizationId = org.id;

            // Create default 'Admin' role for the organization
            const adminRole = await db.role.create({
                name: 'Admin',
                organization_id: organizationId,
                permissions: [
                    { page: 'all', read: true, create: true, update: true, delete: true }
                ]
            });
            roleId = adminRole.id;
        }

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: req.body.role ? req.body.role : 'user',
            mobile: req.body.mobile,
            office_name: req.body.office_name,
            bar_registration_number: req.body.bar_registration_number,
            organization_id: organizationId,
            role_id: roleId
        });

        res.send({ message: "User was registered successfully!", userId: user.id });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        },
        include: [
            { model: db.role, as: 'custom_role' },
            { model: db.organization, as: 'organization' }
        ]
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.role,
                organization_id: user.organization_id,
                role_id: user.role_id,
                permissions: user.custom_role ? user.custom_role.permissions : null,
                accessToken: token
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};
