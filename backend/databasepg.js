const { Client } = require('pg');

const client = new Client({
    host: "",
    user: "",
    port: 5432,
    password: "",
    database: ""
});

client.connect();

const checkUserIdExists = (userid, callback) => {
    const checkQuery = 'SELECT COUNT(*) FROM login_table WHERE userid = $1';
    client.query(checkQuery, [userid], (err, res) => {
        if (err) {
            console.error('Error checking userid:', err.message);
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            const userExists = parseInt(res.rows[0].count) > 0;
            if (typeof callback === 'function') {
                callback(null, userExists);
            }
        }
    });
};

const insertData = (userid, password, callback) => {
    if (typeof callback !== 'function') {
        throw new TypeError('callback is not a function');
    }

    const insertQuery = 'INSERT INTO login_table (userid, password) VALUES ($1, $2)';
    client.query(insertQuery, [userid, password], (err, res) => {
        if (err) {
            console.error('Error inserting data:', err.message);
            if (typeof callback === 'function') {
                callback(err);
            }
            return;
        }

        console.log('Data inserted successfully');
        if (typeof callback === 'function') {
            callback(null);
        }
    });
};

const updateUserProfile = (userid, name, gmail, callback) => {
    if (typeof callback !== 'function') {
        throw new TypeError('Callback is not a function');
    }

    console.log('Updating user profile with the following details:');
    console.log('User ID:', userid);
    console.log('Name:', name);
    console.log('Email:', gmail);

    const selectQuery = 'SELECT * FROM users WHERE userid = $1';
    client.query(selectQuery, [userid], (err, res) => {
        if (err) {
            console.error('Error selecting user profile:', err.message);
            callback(err);
            return;
        }

        if (res.rows.length === 0) {
            // If user does not exist, insert new profile
            console.log('User profile does not exist, inserting new profile');
            insertUserProfile(userid, name, gmail, callback);
        } else {
            // If user exists, update profile
            console.log('User profile found, updating profile');
            const updateQuery = 'UPDATE users SET name = $1, gmail = $2 WHERE userid = $3';
            client.query(updateQuery, [name, gmail, userid], (err, res) => {
                if (err) {
                    console.error('Error updating user profile:', err.message);
                    callback(err);
                    return;
                }

                console.log('User profile updated successfully');
                callback(null);
            });
        }
    });
};

const insertUserProfile = (userid, name, gmail, callback) => {
    const insertQuery = 'INSERT INTO users (userid, name, gmail) VALUES ($1, $2, $3)';
    client.query(insertQuery, [userid, name, gmail], (err, res) => {
        if (err) {
            console.error('Error inserting user profile:', err.message);
            callback(err);
            return;
        }

        console.log('User profile inserted successfully');
        callback(null);
    });
};

const fetchUserProfile = (userid, callback) => {
    if (typeof callback !== 'function') {
        throw new TypeError('Callback is not a function');
    }

    console.log('Fetching user profile with the following user ID:', userid);

    const selectQuery = 'SELECT * FROM users WHERE userid = $1';
    client.query(selectQuery, [userid], (err, res) => {
        if (err) {
            console.error('Error fetching user profile:', err.message);
            callback(err, null);
            return;
        }

        if (res.rows.length === 0) {
            console.log('User profile not found');
            insertUserProfile(userid, null, null, callback);
            callback(null, null); // User not found, return null
            return;
        }

        const userProfile = res.rows[0]; // Assuming there's only one user with the given userid
        console.log('User profile fetched successfully:', userProfile);
        callback(null, userProfile);
    });
};

const signUp = (userid, password) => {
    return new Promise((resolve, reject) => {
        checkUserIdExists(userid, (err, userExists) => {
            if (err) {
                console.error('Error during userid check:', err.message);
                reject(err);
                return;
            }

            if (userExists) {
                console.log('User ID already exists, sign up failed.');
                reject(new Error('User ID already exists'));
                return;
            }

            insertData(userid, password, (err) => {
                if (err) {
                    console.error('Error during user registration:', err.message);
                    reject(err);
                    return;
                }
                console.log('Sign up successful');
                resolve();
            });
        });
    });
};

const signIn = (userid, password) => {
    return new Promise((resolve, reject) => {
        checkUserIdExists(userid, (err, userExists) => {
            if (err) {
                console.error('Error during userid check:', err.message);
                reject(err);
                return;
            }

            if (!userExists) {
                console.log('User ID does not exist, sign in failed.');
                reject(new Error('User ID does not exist'));
                return;
            }

            const signInQuery = 'SELECT userid, password FROM login_table WHERE userid = $1 AND password = $2';
            client.query(signInQuery, [userid, password], (err, res) => {
                if (err) {
                    console.error('Error during sign in:', err.message);
                    reject(err);
                    return;
                }

                if (res.rows.length === 0) {
                    console.log('Invalid password, sign in failed.');
                    reject(new Error('Invalid password'));
                    return;
                }

                console.log('Sign in successful');
                const userData = res.rows[0];
                resolve(userData);
            });
        });
    });
};

const insertMessages = (senderId, messageText, callback) => {
    const insertQuery = 'INSERT INTO messages (sender_id, message_text) VALUES ($1, $2)';
    client.query(insertQuery, [senderId, messageText], (err, res) => {
        if (err) {
            console.error('Error inserting message:', err.message);
            if (typeof callback === 'function') {
                callback(err);
            }
            return;
        }
        console.log('Message inserted successfully');
        if (typeof callback === 'function') {
            callback(null);
        }
    });
};

const fetchAllMessages = () => {
    return new Promise((resolve, reject) => {
        const fetchQuery = 'SELECT * FROM public.messages ORDER BY timestamp ASC';
        client.query(fetchQuery, (err, res) => {
            if (err) {
                console.error('Error fetching messages:', err.message);
                reject(err);
                return;
            }
            const messages = res.rows;
            console.log('Messages fetched successfully');
            resolve(messages);
        });
    });
};

module.exports = {
    signUp,
    checkUserIdExists,
    insertData,
    insertMessages,
    signIn,
    fetchAllMessages,
    updateUserProfile,
    fetchUserProfile
};
