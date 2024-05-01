const statesData = require('../model/statesData.json');

const stateCodes = statesData.map(state => state.stateCode.toUpperCase());


const verifyStates = (req, res, next) => {
    const stateParam = req.params.state.toUpperCase();

    if (stateCodes.includes(stateParam)) {
        req.code = stateParam;
        next();
    } else {
        res.status(400).json({ error: 'Invalid state code' });
    }
};

module.exports = verifyStates;