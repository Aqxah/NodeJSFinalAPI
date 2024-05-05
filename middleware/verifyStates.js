const statesData = require('../model/statesData.json');

const stateCodes = statesData.map(state => state.stateCode.toUpperCase());

const verifyStates = (req, res, next) => {
    const stateParam = req.params.state;

    // Check if stateParam is provided and is a string
    if (!stateParam || typeof stateParam !== 'string') {
        return res.status(400).json({ error: 'Invalid state code parameter' });
    }

    // Convert the state code parameter to uppercase
    const stateCode = stateParam.toUpperCase();

    // Check if the state code is valid
    if (stateCodes.includes(stateCode)) {
        req.code = stateCode;
        next();
    } else {
        res.status(400).json({ error: 'Invalid state code' });
    }
};

module.exports = verifyStates;