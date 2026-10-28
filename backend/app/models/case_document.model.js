module.exports = (sequelize, Sequelize) => {
    const CaseDocument = sequelize.define("case_documents", {
        file_name: {
            type: Sequelize.STRING
        },
        file_url: {
            type: Sequelize.STRING
        },
        link_url: {
            type: Sequelize.STRING
        },
        uploaded_by: {
            type: Sequelize.INTEGER
        }
    });

    return CaseDocument;
};
