const State = require('../model/State')

const getAllStates = async (req, res) => {
        const states = await State.find();
        if (!states || states.length === 0) return res.status(204).json({ 'message': 'No states found' });
        res.json(states);
}

const getContiguousStates = async (req, res) => {
    const isContiguous = req.query.contig === 'true';
    try {
        const states = await State.find({ contiguous: isContiguous });
        if (!states || states.length === 0) {
            return res.status(404).json({ 'error': 'No states found' });
        }
        res.json(states);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const getStateByCode = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state) {
            return res.status(404).json({ 'error': 'State not found' });
        }
        res.json(state);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const getRandomFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ 'error': 'No fun facts found for this state' });
        }
        const randomFact = state.funfacts[Math.floor(Math.random() * state.funfacts.length)];
        res.json({ 'funfact': randomFact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const getStateCapital = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state) {
            return res.status(404).json({ 'error': 'State not found' });
        }
        res.json({ 'state': state.stateName, 'capital': state.capital });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const getStateNickname = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state) {
            return res.status(404).json({ 'error': 'State not found' });
        }
        res.json({ 'state': state.stateName, 'nickname': state.nickname });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const getStatePopulation = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state) {
            return res.status(404).json({ 'error': 'State not found' });
        }
        res.json({ 'state': state.stateName, 'population': state.population });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const getStateAdmission = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state) {
            return res.status(404).json({ 'error': 'State not found' });
        }
        res.json({ 'state': state.stateName, 'admitted': state.admissionDate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}

const addFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { funfact } = req.body;
    try {
        const state = await State.findOneAndUpdate(
            { stateCode: stateCode },
            { $push: { funfacts: funfact } },
            { new: true }
        );
        if (!state) {
            return res.status(404).json({ 'error': 'State not found' });
        }
        res.json(state);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
};

const updateFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index, funfact } = req.body;
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ 'error': 'No fun facts found for this state' });
        }
        if (index < 1 || index > state.funfacts.length) {
            return res.status(400).json({ 'error': 'Invalid index' });
        }
        state.funfacts[index - 1] = funfact;
        await state.save();
        res.json(state);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
};

const deleteFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index } = req.body;
    try {
        const state = await State.findOne({ stateCode: stateCode });
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ 'error': 'No fun facts found for this state' });
        }
        if (index < 1 || index > state.funfacts.length) {
            return res.status(400).json({ 'error': 'Invalid index' });
        }
        state.funfacts.splice(index - 1, 1);
        await state.save();
        res.json(state);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
};

module.exports = {
    getAllStates,
    getContiguousStates,
    getStateByCode,
    getRandomFunFact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission,
    addFunFact,
    updateFunFact,
    deleteFunFact
}