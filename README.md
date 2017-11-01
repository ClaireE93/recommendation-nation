# Recommendation Nation

This app is a clone of Amazon's general product recommendation server engine.

This microservice in particular generates user recommendations using Collaborative Filtering. Recommendations are calculated using Singular Value Decomposition (SVD) and analyzed using Mean Absolute Error (MAE).

This service is connected to the larger clone using Amazon's Simple Queue Service (SQS).

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
createdb purchases
node setup/index.js
```
Once the database is setup and seeded, run the following:
```
npm start
```

## Requirements

- Node 6.9.x
- Express
- Postgresql 9.6.x
- MongoDB
- Python
- SciKit

## Other Information

(TODO: fill this out with details about your project. Suggested ideas: architecture diagram, schema, and any other details from your app plan that sound interesting.)
