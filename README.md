# Hiking Trails Review App 

This repository contains the code for a Hiking Trail Review app built using the Express, Node.js, and MongoDB stack. The app allows users to search for and review trails, similar to the popular Yelp platform.

## Features

- User registration and authentication
- Trails search functionality
- Trails details and reviews
- User review submission
- User profile management

## Prerequisites

- Node.js (v14.17.0 or higher)
- MongoDB (v4.4.0 or higher)

## Getting Started

1. Clone the repository:

```shell
git clone https://github.com/NeloferArj/Yelp_cloneApp.git
cd yelp-clone
```

2. Install the dependencies for the backend:

```shell
npm install
```

3. Create a `.env` file in the `backend` directory and provide the following variables:

```
MONGODB_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-secret-key>
```

4. Start the backend server:

```shell
nodemon app.js
```

5. Open your web browser and visit `http://localhost:4200` to access the app.

## Folder Structure

- app.js: Contains the backend codebase written in Node.js using Express.js framework.
- views: Contains the frontend written in HTML and EJS

## Acknowledgments

- This app is inspired by the original [Yelp](https://www.yelp.com/) platform.
- The Express, Node.js, MongoDB stack provides a robust and efficient framework for building full-stack JavaScript applications.
