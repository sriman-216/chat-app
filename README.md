# Real-Time Chat Application Task

## Description

Real-Time Chat Application Task is a robust and reliable real-time chat application that provides a space for multiple people to interact with each other.

## Features

- User Registration and Authentication: Users should be able to register with a username and
password. Implement authentication mechanisms to ensure secure access to the chat application.

- Real-Time Messaging: Users should be able to send and receive messages in real-time. Messages should support text.

- Message History: Store and retrieve chat history for users. Allow users to view past messages
when joining a chat room.

- User Profile Management: Allow users to update their profile information.

## Technologies Used

- **Frontend**: CSS
- **Backend**: Node.js with Express.js
- **Real-time Communication**: Socket.io
- **Database**: PostgreSQL

## Installation
1. Clone the repository: `git clone [repository-url]`

2. Navigate to the backend folder 
    `use npm install`
3. Do same thing in main folder

4. Change the credentials in databasepg.js file as per your database

5. Run this 3 qureies in to create tables needed
    CREATE TABLE public.login_table
    (
    userid VARCHAR(256) PRIMARY KEY,
    password VARCHAR(256)
    );
    CREATE TABLE public.users
    (
    userid VARCHAR(256) PRIMARY KEY,
    name VARCHAR(256),
    gmail VARCHAR(256)
    );
    CREATE TABLE public.messages
    (
    sender_id VARCHAR(256),
    message_text VARCHAR(256),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

### Requirements

- Node.js
- PostgreSQL


## Usage
This project consists of six web pages, each containing a button that allows users to navigate to the next page. The pages are interconnected in a linear sequence.
