const admin = require("firebase-admin");
const assert = require("assert");
module.exports = async (application, QUERY) => {
    const { config } = application; 

    // don't change order of this!! otherwise it won't work!
    const serviceAccount = {
        "type": config.fbDb.type,
        "project_id": config.fbDb.project_id,
        "private_key_id": config.fbDb.private_key_id,
        "private_key": config.fbDb.private_key,
        "client_email": config.fbDb.client_email,
        "client_id": config.fbDb.client_id,
        "auth_uri": config.fbDb.auth_uri,
        "token_uri": config.fbDb.token_uri,
        "auth_provider_x509_cert_url": config.fbDb.auth_provider_x509_cert_url,
        "client_x509_cert_url": config.fbDb.client_x509_cert_url,
        "universe_domain": config.fbDb.universe_domain,
    };
    try {
        
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount)});
        const db = admin.firestore();
        const dbColllection = db.collection('addressbook'); 
        const insertItem = await dbColllection.doc().set(QUERY); 
        return insertItem;
    } catch (error) { 
        return { error: "Internal server error", code: 500, message: error.message };
    }
};