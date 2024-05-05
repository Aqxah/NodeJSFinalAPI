const State = require('../model/State')
const fs = require('fs');
const path = require('path');

const getStateData = path.join(__dirname, '..', 'model', 'statesData.json');

const getAllStates = async (req, res) => {
    try {
        // Read the JSON file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                let statesData = JSON.parse(data);

                // Fetch fun facts from MongoDB
                const funfacts = await State.find({}, { stateCode: 1, funfacts: 1 });

                // Check if funfacts is defined and not empty
                if (funfacts && funfacts.length > 0) {
                    // Merge fun facts with statesData
                    statesData.forEach(state => {
                        const foundFunfacts = funfacts.find(fact => fact.stateCode === state.stateCode);
                        if (foundFunfacts) {
                            state.funfacts = foundFunfacts.funfacts;
                        }
                    });
                } else {
                    console.log('No fun facts found in MongoDB.');
                }

                // Filter states based on contig query parameter if provided
                const contigParam = req.query.contig;
                if (contigParam !== undefined) {
                    if (contigParam === 'true') {
                        // Filter out AK and HI for contiguous states
                        statesData = statesData.filter(state => state.stateCode !== 'AK' && state.stateCode !== 'HI');
                    } else if (contigParam === 'false') {
                        // Filter only AK and HI for non-contiguous states
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
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Check if the state code is valid
        if (!isValidStateCode(stateCode)) {
            return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
        }

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                let state = statesData.find(state => state.stateCode === stateCode);

                // If state not found, return 404
                if (!state) {
                    return res.status(404).json({ message: 'State not found' });
                }

                // Fetch fun facts from MongoDB for the requested state
                const funfacts = await State.findOne({ stateCode }, { funfacts: 1 });

                // If fun facts exist, attach them to the state data
                if (funfacts && funfacts.funfacts) {
                    state = { ...state, funfacts: funfacts.funfacts };
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

        // Check if the state code matches the expected format (two letters)
        if (!/^[A-Z]{2}$/.test(stateCode)) {
            return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
        }

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'State not found' });
                }

                // Check if the state has any fun facts
                if (!state.funfacts || state.funfacts.length === 0) {
                    return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
                }

                // Select a random fun fact from the array of fun facts
                const randomIndex = Math.floor(Math.random() * state.funfacts.length);
                const randomFunFact = state.funfacts[randomIndex];

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

        // Check if the state code matches the expected format (two letters)
        if (!/^[A-Z]{2}$/.test(stateCode)) {
            return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
        }

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                if (!state) {
                    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
                }

                // Format population with correct comma placement
                const formattedPopulation = state.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

                res.json({ state: state.state, population: formattedPopulation });
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
        let stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Check if the state code matches the expected format (two letters)
        if (!/^[A-Z]{2}$/.test(stateCode)) {
            return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
        }

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                if (!state) {
                    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
                }

                // Respond with the state and admitted properties
                res.json({ state: state.state, admitted: state.admitted });
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

const addFunfacts = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase
        const { funfacts } = req.body;

        // Check if funfacts data is provided
        if (!funfacts || funfacts.length === 0) {
            return res.status(400).json({ error: 'State fun facts value required' });
        }

        // Verify that funfacts is an array
        if (!Array.isArray(funfacts)) {
            return res.status(400).json({ error: 'State fun facts value must be an array' });
        }

        // Find the state in MongoDB collection
        let state = await State.findOne({ stateCode });

        if (!state) {
            // If state not found, create a new record with stateCode and funfacts
            state = new State({ stateCode, funfacts });
        } else {
            // If state found, add new fun facts to the existing ones
            state.funfacts = state.funfacts.concat(funfacts);
        }

        // Save the updated state data to the MongoDB collection
        await state.save();

        res.json({ message: 'Fun facts added successfully', state });
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
        if (!index || isNaN(index)) {
            return res.status(400).json({ error: 'State fun fact index value required.' });
        }

        if (!funFact || typeof funFact !== 'string') {
            return res.status(400).json({ error: 'State fun fact value required as a string.' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Find the state in MongoDB collection
        const state = await State.findOne({ stateCode });

        if (!state || !state.funfacts) {
            return res.status(404).json({ error: `No Fun Facts found for ${stateCode}` });
        }

        // Check if the provided index is valid
        if (zeroBasedIndex < 0 || zeroBasedIndex >= state.funfacts.length) {
            return res.status(404).json({ error: `No Fun Fact found at that index for ${stateCode}` });
        }

        // Update the fun fact at the specified index
        state.funfacts[zeroBasedIndex] = funFact;

        // Save the updated state data back to MongoDB
        await state.save();

        // Respond with the updated state data
        res.json({ state, message: 'Fun fact updated successfully' });
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
            return res.status(400).json({ error: 'State fun fact index value required.' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Retrieve the state data from MongoDB
        const state = await State.findOne({ stateCode });

        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ error: `No Fun Facts found for ${state}` });
        }

        // Check if the provided index is valid
        if (zeroBasedIndex < 0 || zeroBasedIndex >= state.funfacts.length) {
            return res.status(404).json({ error: `No Fun Fact found at that index for ${state}` });
        }

        // Remove the fun fact at the specified index
        state.funfacts.splice(zeroBasedIndex, 1);

        // Save the updated state data back to MongoDB
        await state.save();

        // Respond with the updated state data
        res.json({ state, message: 'Fun fact deleted successfully' });
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
    addFunfacts,
    updateFunFact,
    deleteFunFact
}