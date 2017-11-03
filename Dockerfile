# Use official node runtime as parent script
FROM datagovsg/python-node:3.5-6.9.4

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in requirements.txt
RUN python -m pip install --user numpy scipy pandas scikit-learn pymongo elasticsearch && npm install

# Make port 80 available to the world outside this container
EXPOSE 80

# Run setup when the container launches
#CMD ["node", "server/index.js"]
