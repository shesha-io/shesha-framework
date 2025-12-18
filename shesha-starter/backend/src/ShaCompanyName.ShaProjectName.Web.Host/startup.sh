#!/bin/bash

echo "Installing system dependencies for Linux App Service..."

# Update package lists
apt-get update

# Install required libraries
# apt-get install -y libc6 libgdiplus libicu-dev libharfbuzz0b libfontconfig1 libfreetype6
# apt-get install -y libpango-1.0-0 libpangocairo-1.0


apt-get install -y libc6 libgdiplus libicu-dev libharfbuzz0b libfontconfig1 libfreetype6
apt-get install -y libpango-1.0-0 libpangocairo-1.0
apt-get install -y libfontconfig1

# Clean up
apt-get clean && rm -rf /var/lib/apt/lists/*

echo "System dependencies installed successfully."

# Start the .NET application
# dotnet Boxfusion.SheshaCloud.Web.Host.dll
dotnet $(ls *.Web.Host.dll | head -1)
