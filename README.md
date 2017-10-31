# Project Name

The project description

## Roadmap

View the project roadmap [here](LINK_TO_DOC)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)

## Usage

To install all project dependencies, run the following:
```
npm install
pip install -r requirements.txt
```

To start the app, run the following:
```
node db/purchases/setup.js
node generators/historic.js
```
Once the database is seeded using historic.js, run the following:
```
npm run startdb
npm start
```

## Requirements

- Node 6.9.x
- Express
- Postgresql 9.6.x
- MongoDB
- Mongoose

## Other Information

(TODO: fill this out with details about your project. Suggested ideas: architecture diagram, schema, and any other details from your app plan that sound interesting.)
