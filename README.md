# Recommendation Nation

This app is a clone of Amazon's general product recommendation server engine.

This microservice in particular generates user recommendations using Collaborative Filtering. Recommendations are calculated using Singular Value Decomposition (SVD) and analyzed using Mean Absolute Error (MAE).

This service is connected to the larger clone using Amazon's Simple Queue Service (SQS).

## Architecture

View the service's architecture [here](https://drive.google.com/file/d/1KN3DkLuTRE_eF21fp6d0WIAfTyBD6Pe2/view?usp=sharing)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)

## Usage

To run app using Docker, run the following from the root directory:
```
docker-compose up
```
Otherwise...
To install all project dependencies, run the following:
```
npm install
pip install -r requirements.txt
```

To start the app, run the following:
```
createdb purchases
```
Once the database is setup and seeded, run the following:
```
npm start
```

## Requirements

- Node
- Express
- PostgreSQL
- MongoDB
- Elasticsearch
- Python
- SciPy
