(function () {
    const app = document.querySelector(".app");
    const socket = io();
    let uname;

    app.querySelector(".home-screen #go-to-signup").addEventListener("click", function () {
        console.log("Navigating to signup screen...");
        app.querySelector(".home-screen").classList.remove("active");
        app.querySelector(".signup-screen").classList.add("active");
    });
    app.querySelector(".home-screen #go-to-signin").addEventListener("click", function () {
        console.log("Navigating to signin screen...");
        app.querySelector(".home-screen").classList.remove("active");
        app.querySelector(".signin-screen").classList.add("active");
    });
    app.querySelector(".signup-screen #signup").addEventListener("click", function () {
        let username = app.querySelector(".signup-screen #signup-username").value;
        let password = app.querySelector(".signup-screen #signup-password").value;
        let confirmPassword = app.querySelector(".signup-screen #confirm-password").value; // Retrieve confirmation password
        uname = username;
    
        if (username.length === 0) {
            console.log("Username is required.");
            alert("Username is required.");
            return;
        }
        if (password.length === 0) {
            console.log("Password is required.");
            alert("Password is required.");
            return;
        }
        if (password !== confirmPassword) { // Check if password and confirmation password match
            console.log("Passwords do not match.");
            alert("Passwords do not match.");
            return;
        }
        console.log(`Attempting to sign up with username: ${username}`);
        socket.emit("signup", { username, password });

        // Event listener for signup success
        socket.on("signupSuccess", function () {
            // Redirect to sign-in screen
            app.querySelector(".signup-screen").classList.remove("active");
            app.querySelector(".signin-screen").classList.add("active");

            // Remove the event listener after successful signup
            socket.off("signupSuccess");
        });

        // Event listener for signup error
        socket.on("signupError", function (errorMessage) {
            console.error("Sign up error:", errorMessage);
            alert(errorMessage); // Display error message to the user
            // Remove the event listener after receiving the error
            socket.off("signupError");
        });
        socket.on("userIdexist", function (errorMessage) {
            console.error("Sign up error:", errorMessage);
            alert("userId exist"); // Display error message to the user
            // Remove the event listener after receiving the error
            socket.off("signupError");
        });
    });
    app.querySelector(".signin-screen #signin").addEventListener("click", function () {
        let username = app.querySelector(".signin-screen #signin-username").value;
        let password = app.querySelector(".signin-screen #signin-password").value;
        uname = username;
        console.log(`Sending user: ${uname}`);

        if (username.length === 0) {
            console.log("Username is required.");
            alert("Username is required.");
            return;
        }
        if (password.length === 0) {
            console.log("Password is required.");
            alert("Password is required.");
            return;
        }

        console.log(`Attempting to sign in with username: ${username}`);
        socket.emit("signin", { username, password });
    });
    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        console.log(`Sending user: ${uname}`);

        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length === 0) {
            console.log("Message is empty.");
            return;
        }
        console.log(`Sending message: ${message}`);
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        console.log("Exiting chat...");
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });
    app.querySelector(".chat-screen #profile").addEventListener("click", function () {
        // Emit an event to the server to fetch the user profile
        socket.emit("getProfile", { username: uname });
    });
    app.querySelector(".profile-view #edit-profile").addEventListener("click", function () {
        
        app.querySelector(".profile-view").classList.remove("active");
        app.querySelector(".profile-edit").classList.add("active");
    });
    app.querySelector(".profile-view #back-to-chat").addEventListener("click", function () {
        app.querySelector(".profile-view").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });
    app.querySelector(".profile-edit #cancel-edit").addEventListener("click", function () {
        app.querySelector(".profile-edit").classList.remove("active");
        app.querySelector(".profile-view").classList.add("active");
        
    });
    app.querySelector(".profile-edit #save-profile").addEventListener("click", function () {
        const newName = app.querySelector(".profile-edit #edit-name").value;
        const newEmail = app.querySelector(".profile-edit #edit-email").value;

        console.log("editing profile. New name:", newName, "New email:", newEmail);

        // Check if any changes were made before emitting the updateProfile event
        if (newName !== '' || newEmail !== '') {
            // Only emit updateProfile event if there are changes
            socket.emit("updateProfile", { username: uname, name: newName, email: newEmail });

            socket.on("updateProfileSuccess", function () {
                console.log("Profile updated successfully.");
                app.querySelector(".profile-view").classList.add("active");
                app.querySelector(".profile-edit").classList.remove("active");

                app.querySelector(".profile-view #profile-name").textContent = newName;
                app.querySelector(".profile-view #profile-email").textContent = newEmail;

                socket.off("updateProfileSuccess");
            });

            socket.on("updateProfileError", function (errorMessage) {
                console.error("Update profile error:", errorMessage);
                alert(errorMessage);
                socket.off("updateProfileError");
            });
        } else {
            // If no changes were made, simply switch back to profile view
            app.querySelector(".profile-view").classList.add("active");
            app.querySelector(".profile-edit").classList.remove("active");
        }
    });

    socket.on("fetchProfileSuccess", function ({ name, gmail }) {
        // Update the profile details displayed in the view
        console.log("Fetched Profile Details:");
        console.log("Username:", name);
        console.log("Email:", gmail);

        app.querySelector(".profile-view #profile-name").textContent = name;
        app.querySelector(".profile-view #profile-email").textContent = gmail;

        // Print all the fetched profile details for verification
        // Switch to the profile view screen
        app.querySelector(".chat-screen").classList.remove("active");
        app.querySelector(".profile-view").classList.add("active");
    });
    
    socket.on("addMessage", function ({ sender_id, message_text }) {
        console.log(`Received message from sender ID ${sender_id}: ${message_text}`);
        
        // Update the profile details displayed in the view
        if (sender_id == uname) {
            console.log(`Rendering own message: ${message_text}`);
            renderMessage("my", {
                username: uname,
                text: message_text
            });
        } else {
            console.log(`Rendering other user's message: ${message_text}`);
            renderMessage("others", {
                username: sender_id,
                text: message_text
            });
        }
    });
    
    socket.on("signinSuccess", function (userData) {
        console.log("Sign in successful");
        // uname = userData.username;
        console.log(`Sending user: ${uname}`);

        app.querySelector(".signin-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
        // Optionally, you can display a welcome message or perform other actions
    });

    socket.on("signinError", function (errorMessage) {
        console.error("Sign in error:", errorMessage);
        alert(errorMessage); // Display error message to the user
        // Optionally, you can clear the input fields or perform other actions
    });

    socket.on("update", function (update) {
        console.log("Received update:", update);
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        console.log("Received message:", message);
        renderMessage("others", message);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (!messageContainer) {
            console.error("Message container not found!");
            return;
        }

        if (type === "my") {
            let e1 = document.createElement("div");
            e1.setAttribute("class", "message my-message");
            e1.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(e1);
        } else if (type === "others") {
            let e1 = document.createElement("div");
            e1.setAttribute("class", "message other-message");
            e1.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(e1);
        } else if (type === "update") {
            let e1 = document.createElement("div");
            e1.setAttribute("class", "update");
            e1.innerText = message;
            messageContainer.appendChild(e1);
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
    
})();
