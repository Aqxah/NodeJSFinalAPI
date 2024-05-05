const State = require('../model/State')
const fs = require('fs');
const path = require('path');

const getStateData = path.join(__dirname, '..', 'model', 'statesData.json');

const getAllStates = async (req, res) => {
    try {
        // Fetch fun facts from MongoDB
        const funfacts = await State.find({}, { stateCode: 1, funfacts: 1 });

        // Read the JSON file
        fs.readFile(getStateData, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ 'error': 'Error reading JSON file' });
            }

            try {
                let statesData = JSON.parse(data);

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
                if (contigParam) {
                    if (contigParam === 'true') {
                        statesData = statesData.filter(state => state.stateCode !== 'AK' && state.stateCode !== 'HI');
                    } else if (contigParam === 'false') {
                        statesData = statesData.filter(state => state.stateCode === 'AK' || state.stateCode === 'HI');
                    }
                }

                // Check if funfacts property exists for required states
                const statesWithFunfacts = statesData.filter(state => ['KS', 'NE', 'OK', 'MO', 'CO'].includes(state.stateCode));
                if (statesWithFunfacts.length !== 5) {
                    console.error('Records for KS, NE, OK, MO and CO do not have funfacts property');
                } else {
                    // Check if each of these states has 3 or more fun facts
                    const statesWithEnoughFunfacts = statesWithFunfacts.filter(state => state.funfacts && state.funfacts.length >= 3);
                    if (statesWithEnoughFunfacts.length !== 5) {
                        console.error('Records for KS, NE, OK, MO and CO do not have 3 or more fun facts');
                    }
                }

                // Check if funfacts property doesn't exist for required states
                const statesWithoutFunfacts = statesData.filter(state => ['NH', 'RI', 'GA', 'AZ', 'MT'].includes(state.stateCode));
                if (statesWithoutFunfacts.some(state => !state.funfacts)) {
                    console.error('Records for NH, RI, GA, AZ and MT do not have funfacts property');
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

                // Check if the state code is valid
                if (!isValidStateCode(stateCode)) {
                    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
                }

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
                const funfacts = await State.findOne({ stateCode }, { funfacts: 1 });

                if (!funfacts || !funfacts.funfacts || funfacts.funfacts.length === 0) {
                    return res.json({ message: 'No fun facts available for this state' });
                }

                // Select a random fun fact from the array of fun facts
                const randomIndex = Math.floor(Math.random() * funfacts.funfacts.length);
                const randomFunFact = funfacts.funfacts[randomIndex];

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
                const state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                if (!state) {
                    return res.status(404).json({ message: 'State not found' });
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

        // Verify that funfacts data is provided and is an array
        if (!funfacts) {
            return res.status(400).json({ error: 'State fun facts value required' });
        }

        if (!Array.isArray(funfacts)) {
            return res.status(400).json({ error: 'State fun facts value must be an array' });
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
                let state = statesData.find(state => state.stateCode.toUpperCase() === stateCode);

                if (!state) {
                    // If state not found, create a new record with stateCode and funfacts
                    state = { stateCode, funfacts: funfacts };
                    statesData.push(state);
                } else {
                    // If state found, add new fun facts to the existing ones
                    state.funfacts = [...state.funfacts, ...funfacts];
                }

                // Save the updated statesData to the JSON file
                fs.writeFile(getStateData, JSON.stringify(statesData, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                        return res.status(500).json({ error: 'Error writing to JSON file' });
                    }
                });

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
            return res.status(404).json({ error: `No Fun Facts found for {$state}` });
        }

        // Check if the provided index is valid
        if (zeroBasedIndex < 0 || zeroBasedIndex >= state.funfacts.length) {
            return res.status(404).json({ error: `No Fun Fact found at that index for {$state}` });
        }

        // Update the fun fact at the specified index
        state.funfacts[zeroBasedIndex] = funFact;

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
            return res.status(400).json({ error: 'State fun fact index value required.' });
        }

        // Adjust the index to be zero-based
        const zeroBasedIndex = parseInt(index) - 1;

        // Retrieve the state data from MongoDB
        const state = await State.findOne({ stateCode });

        if (!state || !state.funfacts || state.funfacts.length === 0) {
            return res.status(404).json({ error: `No Fun Facts found for {$state}` });
        }

        if (!state.funfacts[zeroBasedIndex]) {
            return res.status(404).json({ error: `No Fun Fact found at that index for {$state}` });
        }

        // Remove the fun fact at the specified index
        state.funfacts.splice(zeroBasedIndex, 1);

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
    addFunfacts,
    updateFunFact,
    deleteFunFact
}