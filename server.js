const { fetchAllMessages, fetchUserProfile, updateUserProfile, insertMessages, insertData, checkUserIdExists, signIn, signUp } = require('./backend/databasepg.js');
const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    console.log("New connection established");

    socket.on("signin", async function ({ username, password }) {
        console.log(`Sign in attempt: ${username}`);
        try {
            const userData = await signIn(username, password);
            console.log(userData);
            if (userData) {
                console.log(`User signed in successfully: ${username}`);
                socket.emit("signinSuccess", userData);
                fetchAllMessages()
                    .then(messages => {
                        // Handle messages
                        // console.log(messages);
                        messages.forEach(message => {
                            const { sender_id, message_text } = message;
                            console.log(`Sender ID: ${sender_id}, Message: ${message_text}`);
                            socket.emit("addMessage", { sender_id, message_text });

                        });

                    })
                    .catch(error => {
                        // Handle error
                        console.error(error);
                    });

                // socket.emit("fetchAllMessagesSuccess", messages);
                socket.broadcast.emit("update", `${username} joined`);
            } else {
                console.log(`Sign in faied for user: ${username}`);
                socket.emit("signinError", "Invalid credentials.");
            }
        } catch (error) {
            console.error("Error during sign in: ", error);
            socket.emit("signinError", "Sign in failed.");
        }
    });
    socket.on("signup", async function ({ username, password }) {
        try {
            checkUserIdExists(username, (err, userExists) => {
                if (err) {
                    console.error('Error during userid check:', err.message);
                    console.error("Error during user registration: ", err);
                    socket.emit("signupError", "User registration failed.");
                    return;
                }

                if (userExists) {
                    console.log('User ID already exists, sign up failed.');
                    socket.emit("signupError", "User already exists.");
                    return;
                }

                insertData(username, password, (err) => {
                    if (err) {
                        console.error('Error during user registration:', err.message);
                        console.error("Error during user registration: ", err);
                        socket.emit("signupError", "User registration failed.");
                        // reject(err);
                        return;
                    }
                    console.log('Sign up successful');
                    socket.emit("signupSuccess");

                    // resolve();
                });
            });
        } catch (error) {
            console.error("Error during user registration: ", error);
            socket.emit("signupError", "User registration failed.");
        }
    });

    socket.on("getProfile", async function ({ username }) {
        // Fetch the user profile from the database
        fetchUserProfile(username, (err, userProfile) => {
            if (err) {
                console.error('Error fetching user profile:', err.message);
                // Handle error
            } else if (userProfile) {
                console.log('User profile:', userProfile);
                const { name, gmail } = userProfile;

                console.log("Fetched Profile Details:");
                console.log("Username:", name);
                console.log("Email:", gmail);
                // Emit the fetched profile data back to the client
                socket.emit("fetchProfileSuccess", { name, gmail });

                // Handle user profile data
            } else {
                console.log('User profile not found');
                // Handle case where user profile is not found
            }
        });
    });

    socket.on("updateProfile", async function ({ username, name, email }) {
        console.log("updateProfile event received:");
        console.log("Username:", username);
        console.log("Name:", name);
        console.log("Email:", email);

        try {
            console.log("Attempting to update profile in database...");
            updateUserProfile(username, name, email, (error) => {
                if (error) {
                    console.error('Error during user details update:', error.message);
                    // callback(error);
                    socket.emit("updateProfileError", "Failed to update profile.");

                    return;
                }
                console.log('Update successful');
                // callback(null);
            });
            console.log("Profile updated successfully in database.");
            socket.emit("updateProfileSuccess");
        } catch (error) {
            console.error("Error updating profile:", error);
            socket.emit("updateProfileError", "Failed to update profile.");
        }
    });

    socket.on("exituser", function (username) {
        console.log(`User exit: ${username}`);
        socket.broadcast.emit("update", `${username} left`);
    });
    
    socket.on("chat", function (message) {
        console.log(`Chat message from ${message.username}: ${message.text}`);
        insertMessages(message.username, message.text); // Call insertMessages to insert the message
        socket.broadcast.emit("chat", message);
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});
