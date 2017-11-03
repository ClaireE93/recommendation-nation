# NOTE: Use linux as parent script, then install node and python
# Use official node runtime as parent script
# FROM python-node:3.5-6.9.4
FROM datagovsg/python-node:3.5-6.9.4

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Working directory for application
# WORKDIR /Users/mtakano/ClaireHackReactor/thesis/recommendation-nation

# Install any needed packages specified in requirements.txt
RUN python -m pip install --user numpy scipy pandas scikit-learn pymongo elasticsearch && npm install
# RUN pip install -r requirements.txt && npm install

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World
# ENV MONGO_URL mongodb://172.17.0.2/27017/recs

# Creates a mount point
#VOLUME [ "/Users/mtakano/ClaireHackReactor/thesis/recommendation-nation" ]

# Run setup when the container launches
# CMD ["node", "setup/index.js"]
#CMD ["node", "server/index.js"]
