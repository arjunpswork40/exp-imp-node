const { makeJsonResponse } = require("../../../utils/response")
const jwt = require('jsonwebtoken');
const Token = require("../../models/Token");

module.exports = {
    
    tokenVerifierFromDB: async (req, res, next) => {
        let apiAuthKeyFromRequest = req.headers['api-auth-key'];
        let apiAuthKey = process.env.SECRET_KEY_JWT || '$123EA$456$9633972298$';
        console.log('apiAuthKeyFromRequest=>',apiAuthKeyFromRequest)
        if (apiAuthKeyFromRequest) {
            const fromDb = await Token.findOne({
                token: apiAuthKeyFromRequest
            }).exec()
            console.log(fromDb)
            if(fromDb) {
                const tokenToCheck = apiAuthKeyFromRequest.slice(12,-34)
        
                    const valuesFromToken = jwt.verify(tokenToCheck,apiAuthKey);
        
                    if (valuesFromToken) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        if(currentTime < valuesFromToken.exp) {
                            return next();
                        } else {
                            let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                            res.status(401).json(response);
                        }
                    } else {
                        let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                        res.status(401).json(response);
                    }
                } else {
                    let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                    res.status(401).json(response);
                }
            } else {
                let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                res.status(401).json(response);
            }
            

    },
    tokenVerifier: async (req, res, next) => {
        let apiAuthKeyFromRequest = req.headers['authorization'];
        let apiAuthKey = process.env.SECRET_KEY_JWT || '$123EA$456$9633972298$';
        if (apiAuthKeyFromRequest) {

            apiAuthKeyFromRequest = apiAuthKeyFromRequest.replace(/\s/g, '')

            // const valuesFromToken = jwt.verify(apiAuthKeyFromRequest,apiAuthKey);
            let valuesFromToken = false;
            try{
                const tokenToCheck = apiAuthKeyFromRequest.slice(12,-34)
                valuesFromToken = jwt.verify(tokenToCheck, apiAuthKey, { algorithm: 'HS256' });
            } catch (error) {
                console.error('Error verifying token:', error.message);
                console.error('Token:', apiAuthKeyFromRequest);
                let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                return res.status(401).json(response);
              }
            if (valuesFromToken) {
                const currentTime = Math.floor(Date.now() / 1000);
                console.log(currentTime < valuesFromToken.exp)
                if(currentTime < valuesFromToken.exp) {
                    next();
                } else {
                    let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                    return res.status(401).json(response);
                }
            } else {
                let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
                return res.status(401).json(response);
            }
        } else {
            let response = makeJsonResponse(`Unauthenticated API request`, {}, {}, 401, false);
            return res.status(401).json(response);
        }
            

    }

}