#!/bin/bash

echo "Setting up HTTPS certificates for local development..."

# Create https directory if it doesn't exist
mkdir -p https

# Clean existing certificates
echo "Cleaning existing certificates..."
dotnet dev-certs https --clean

# Generate new certificate
echo "Generating new development certificate..."
dotnet dev-certs https -ep ./https/aspnetapp.pfx -p password --trust

if [ $? -eq 0 ]; then
    echo "✅ HTTPS certificate generated successfully!"
    echo "   Certificate location: ./https/aspnetapp.pfx"
    echo "   Certificate password: password"
    echo ""
    echo "Now you can run: docker-compose up -d"
    echo "And access:"
    echo "  - HTTP:  http://localhost:21021"
    echo "  - HTTPS: https://localhost:44362"
else
    echo "❌ Certificate generation failed."
    echo "   You can still use HTTP: docker-compose up -d"
    echo "   HTTP will be available at: http://localhost:21021"
fi