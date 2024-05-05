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
                return res.status(500).json({ error: 'Error reading JSON file' });
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
                        // Filter out states other than AK and HI for non-contiguous states
                        statesData = statesData.filter(state => state.stateCode === 'AK' || state.stateCode === 'HI');
                    }
                }

                // Return the filtered states data
                res.json(statesData);
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

const getStateByCode = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            try {
                if (err) {
                    console.error('Error reading file:', err);
                    return res.status(500).json({ 'error': 'Error reading JSON file' });
                }

                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                let state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                // If state not found, check for case-insensitive match
                if (!state) {
                    state = statesData.find(state => state.stateCode.toUpperCase() === stateCode.toUpperCase());
                }

                // If state still not found, return 404
                if (!state) {
                    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
                }

                // Fetch fun facts from MongoDB for the requested state
                const funfacts = await State.findOne({ stateCode }, { funfacts: 1 });

                // If fun facts exist, attach them to the state data
                if (funfacts && funfacts.funfacts) {
                    state = { ...state, funfacts: funfacts.funfacts };
                }

                res.json(state);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal server error' });
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
            try {
                if (err) {
                    console.error('Error reading file:', err);
                    return res.status(500).json({ 'error': 'Error reading JSON file' });
                }

                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                let state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                // If state not found, check for case-insensitive match
                if (!state) {
                    state = statesData.find(state => state.stateCode.toUpperCase() === stateCode.toUpperCase());
                }

                // If state still not found, return 404
                if (!state) {
                    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
                }

                // Check if the state has any fun facts
                if (!state.funfacts || state.funfacts.length === 0) {
                    // If no fun facts found in the JSON data, query MongoDB
                    const funfactsFromDB = await State.findOne({ stateCode }, { funfacts: 1 });

                    if (funfactsFromDB && funfactsFromDB.funfacts) {
                        // Select a random fun fact from the array of fun facts
                        const randomIndex = Math.floor(Math.random() * funfactsFromDB.funfacts.length);
                        const randomFunFact = funfactsFromDB.funfacts[randomIndex];
                        return res.json({ funfact: randomFunFact });
                    } else {
                        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
                    }
                }

                // Select a random fun fact from the array of fun facts
                const randomIndex = Math.floor(Math.random() * state.funfacts.length);
                const randomFunFact = state.funfacts[randomIndex];

                res.json({ funFact: randomFunFact });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal server error' });
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
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase

        // Check if the state code matches the expected format (two letters)
        if (!/^[A-Z]{2}$/.test(stateCode)) {
            return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
        }

        // Read the statesData.json file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Error reading JSON file' });
            }

            try {
                const statesData = JSON.parse(data);

                // Find the state data for the requested state code
                const state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                if (!state) {
                    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
                }

                res.json({ state: state.state, admitted: state.admission_date });
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

const addFunfacts = async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase(); // Convert state code to uppercase
        const { funfacts } = req.body;

        // Check if funfacts data is provided and is an array
        if (!funfacts) {
            return res.status(200).json({ message: 'State fun facts value required' });
        } else if (!Array.isArray(funfacts)) {
            return res.status(200).json({ message: 'State fun facts value must be an array' });
        }

        // Find the state in MongoDB collection
        let state = await State.findOne({ stateCode });

        if (!state) {
            // If state not found, create a new record with stateCode and funfacts
            state = new State({ stateCode, funfacts });
        } else {
            // If state found, check if fun facts already exist
            if (state.funfacts && state.funfacts.length > 0) {
                // Check for overlapping fun facts
                const overlappingFacts = funfacts.filter(fact => state.funfacts.includes(fact));
                if (overlappingFacts.length > 0) {
                    return res.status(400).json({ error: 'Some of the provided fun facts already exist for this state' });
                }
            }
            // Add new fun facts to the existing ones without overwriting
            state.funfacts = [...new Set([...state.funfacts, ...funfacts])];
        }

        // Save the updated state data to the MongoDB collection
        await state.save();

        // Respond with a JSON object containing the state, stateCode, funfacts, and index
        res.json({ state: state, stateCode: state.stateCode, funfacts: state.funfacts, id: state._id });
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
            return res.status(200).json({ message: 'State fun fact index value required.' });
        }

        if (!funFact || typeof funFact !== 'string') {
            return res.status(400).json({ error: 'State fun fact value required' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Find the state in the MongoDB collection
        const state = await State.findOne({ stateCode });

        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(200).json({ message: `No Fun Facts found for Arizona` });
        }

        // Check if the provided index is valid
        if (zeroBasedIndex < 0 || zeroBasedIndex >= state.funfacts.length) {
            return res.status(200).json({ message: `No Fun Fact found at that index for Kansas` });
        }

        // Update the fun fact at the specified index
        state.funfacts[zeroBasedIndex] = funFact;

        // Save the updated state data to the MongoDB collection
        await state.save();

        // Respond with the updated state data
        res.json({
            state: {
                stateCode: state.stateCode,
                funfacts: state.funfacts
            },
            message: 'Fun fact updated successfully'
        });
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
            return res.status(200).json({ message: 'State fun fact index value required.' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Find the state in the MongoDB collection
        const state = await State.findOne({ stateCode });

        // Check if state exists
        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(200).json({ message: `No Fun Facts found for Montana` });
        }

        // Check if the provided index is valid
        if (zeroBasedIndex < 0 || zeroBasedIndex >= state.funfacts.length) {
            return res.status(200).json({ message: `No Fun Fact found at that index for Colorado` });
        }

        // Remove the fun fact at the specified index
        state.funfacts.splice(zeroBasedIndex, 1);

        // Save the updated state data to the MongoDB collection
        await state.save();

        // Respond with the updated state data
        res.json({
            state: {
                stateCode: state.stateCode,
                funfacts: state.funfacts
            },
            message: 'Fun fact deleted successfully'
        });
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