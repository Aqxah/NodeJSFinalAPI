const State = require('../model/State')
const fs = require('fs');
const path = require('path');

const getStateData = path.join(__dirname, '..', 'model', 'statesData.json');

const getAllStates = async (req, res) => {
    try {
        // Fetch fun facts from MongoDB
        const funFacts = await State.find({}, { stateCode: 1, funFacts: 1 });

        // Read the JSON file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                let statesData = JSON.parse(data);

                // Check if funFacts is defined and not empty
                if (funFacts && funFacts.length > 0) {
                    // Merge fun facts with statesData
                    statesData.forEach(state => {
                        const foundFunFacts = funFacts.find(fact => fact.stateCode === state.stateCode);
                        if (foundFunFacts) {
                            state.funFacts = foundFunFacts.funFacts;
                        }
                    });
                } else {
                    console.log('No fun facts found in MongoDB.');
                }

                // Filter states based on contig query parameter if provided
                const contigParam = req.query.contig;
                if (contigParam) {
                    if (contigParam === 'true') {
                        statesData = statesData.filter(state => state.stateCode !== 'AK' && state.stateCode !== 'HI');
                    } else if (contigParam === 'false') {
                        statesData = statesData.filter(state => state.stateCode === 'AK' || state.stateCode === 'HI');
                    }
                }

                // Return the merged states data
                res.json(statesData);
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStateByCode = async (req, res) => {
    try {
        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);
                const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

                // Find the state data for the requested state code
                let state = statesData.find(state => state.stateCode === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'State not found' });
                }

                // Fetch fun facts from MongoDB for the requested state
                const funFacts = await State.findOne({ stateCode }, { funFacts: 1 });

                // If fun facts exist, attach them to the state data
                if (funFacts && funFacts.funFacts) {
                    state = { ...state, funFacts: funFacts.funFacts };
                }

                res.json(state);
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRandomFunFact = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'State not found' });
                }

                // Fetch fun facts from MongoDB for the requested state
                const funFacts = await State.findOne({ stateCode }, { funFacts: 1 });

                if (!funFacts || !funFacts.funFacts || funFacts.funFacts.length === 0) {
                    return res.json({ message: 'No fun facts available for this state' });
                }

                // Select a random fun fact from the array of fun facts
                const randomIndex = Math.floor(Math.random() * funFacts.funFacts.length);
                const randomFunFact = funFacts.funFacts[randomIndex];

                res.json({ funFact: randomFunFact });
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStateCapital = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
                }

                res.json({ state: state.state, capital: state.capital_city });
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStateNickname = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
                }

                res.json({ state: state.state, nickname: state.nickname });
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStatePopulation = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
                }

                res.json({ state: state.state, population: state.population });
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStateAdmission = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
                }

                res.json({ state: state.state, admission_date: state.admission_date });
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ 'error': 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addFunFacts = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase
        const { funFacts } = req.body;

        // Verify that funFacts data is provided and is an array
        if (!funFacts || !Array.isArray(funFacts)) {
            return res.status(400).json({ error: 'Invalid funFacts data provided' });
        }

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state in MongoDB collection
                let state = await State.findOne({ stateCode });

                if (!state) {
                    // If state not found, create a new record with stateCode and funFacts
                    state = new State({ stateCode, funFacts: funFacts });
                } else {
                    // If state found, add new fun facts to the existing ones
                    state.funFacts = [...state.funFacts, ...funFacts];
                }

                // Save the updated state record
                await state.save();

                res.json({ message: 'Fun facts added successfully', state });
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                return res.status(500).json({ error: 'Error parsing JSON data' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateFunFact = async (req, res) => {
    try {
        const { index, funFact } = req.body;
        const stateCode = req.params.state.toUpperCase();

        // Validate input
        if (!index || isNaN(index) || !funFact) {
            return res.status(400).json({ error: 'Both index and funFact are required.' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Find the state in MongoDB collection
        const state = await State.findOne({ stateCode });

        if (!state || !state.funFacts || !state.funFacts[zeroBasedIndex]) {
            return res.status(404).json({ error: 'State not found or funFact at the specified index does not exist.' });
        }

        // Update the fun fact at the specified index
        state.funFacts[zeroBasedIndex] = funFact;

        // Save the updated state data back to MongoDB
        await state.save();

        // Respond with the updated state data
        res.json(state);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteFunFact = async (req, res) => {
    try {
        const { index } = req.body;
        const stateCode = req.params.state.toUpperCase();

        // Validate input
        if (!index || isNaN(index)) {
            return res.status(400).json({ error: 'Index is required and must be a number.' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Retrieve the state data from MongoDB
        const state = await State.findOne({ stateCode });

        if (!state || !state.funFacts || !state.funFacts[zeroBasedIndex]) {
            return res.status(404).json({ error: 'State not found or funFact at the specified index does not exist.' });
        }

        // Remove the fun fact at the specified index
        state.funFacts.splice(zeroBasedIndex, 1);

        // Save the updated state data back to MongoDB
        await state.save();

        // Respond with the updated state data
        res.json(state);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllStates,
    getStateByCode,
    getRandomFunFact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission,
    addFunFacts,
    updateFunFact,
    deleteFunFact
}