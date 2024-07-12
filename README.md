## addressbook

### Description
This is a simple address book application, that allows users to register/login and add contacts to their address book. 

### Features
- User registration
- User login
- Add contact

### Technologies
- NodeJS
- Express
- sqlite3
- firebase (fireStore)

### Installation
- service has been run & tested on node v20.15.1
- clone the repository
- run `npm install` to install dependencies
- setup environment variables 'SALT' and 'jwtSalt' in .env file
- run `npm start` to start the server
- port and other variables can be configured in config/config.json
- run `npm test` to run tests (service should be running)
- and proceed to use POSTMAN to test the endpoints. (added into test folder)

### Endpoints
- GET /status 
    to check service status 
- POST /register
    register a new account
    email, password are required. 
    (email is unique)
    password is stored in db with sha256 hash
- POST /login
    login to an account
    email, password are required
    password is checked against stored hash
    jwt token is generated and returned as cookie
- POST /new-contact
    add a new contact to the address book (firebase)
    [firstName, lastName, address, phoneNumber] are possible fields, no mandatory fields
    jwt token is required from login in headers as cookie.

for any questions reach out to me
hudek.derek@gmail.com

