
module.exports = (sequelize, Sequelize) => {
    const Draft = sequelize.define("drafts", {
        clientIds: {
            type: Sequelize.JSON,
            allowNull: false
        },
        accusedDetails: {
            type: Sequelize.JSON,
            allowNull: true
        },
        courtId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        caseNumberDetails: {
            type: Sequelize.JSON,
            allowNull: true
        },
        party1Label: {
            type: Sequelize.STRING,
            allowNull: true
        },
        party2Label: {
            type: Sequelize.STRING,
            allowNull: true
        },
        keyPoints: {
            type: Sequelize.JSON,
            allowNull: true
        },
        draftTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        draftCategoryId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        advocateIds: {
            type: Sequelize.JSON,
            allowNull: false
        },
        primaryAdvocateId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        advocateRoles: {
            type: Sequelize.JSON,
            allowNull: true
        },
        advocateFees: {
            type: Sequelize.JSON,
            allowNull: true
        },
        generatedHtml: {
            type: Sequelize.TEXT("long"),
            allowNull: true
        },
        firstPageTemplate: {
            type: Sequelize.TEXT("long"),
            allowNull: true
        },
        pdfPath: {
            type: Sequelize.STRING,
            allowNull: true
        },
        signedPdfPath: {
            type: Sequelize.STRING,
            allowNull: true
        },
        generatedBy: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        organizationId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        clientSignatures: {
            type: Sequelize.JSON,
            allowNull: true
        },
        advocateSignatures: {
            type: Sequelize.JSON,
            allowNull: true
        },
        witnessSignatures: {
            type: Sequelize.JSON,
            allowNull: true
        },
        relevantActsAndSections: {
            type: Sequelize.JSON,
            allowNull: true
        },
        vakkalathFor: {
            type: Sequelize.STRING,
            allowNull: true
        },
        executionDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        witnesses: {
            type: Sequelize.JSON,
            allowNull: true
        },
        petitionType: {
            type: Sequelize.STRING,
            allowNull: true
        },
        representedBy: {
            type: Sequelize.JSON,
            allowNull: true
        },
        case_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: "Optional link to a litigation case"
        }
    });

    return Draft;
};
