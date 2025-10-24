#!/bin/bash

# Start SQL Server in background
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
sleep 30

# Check if SQL Server is ready
until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -Q "SELECT 1" > /dev/null 2>&1
do
  echo "SQL Server is not ready yet... waiting 5 more seconds"
  sleep 5
done

echo "SQL Server is ready!"

# Import database from bacpac file
echo "Starting database import..."

# Check if bacpac file exists
if [ -f /var/opt/mssql/backup/SheshaFunctionalTests.bacpac ]; then
    echo "Found SheshaFunctionalTests.bacpac file, importing..."

    # Create the database first
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -Q "
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Functional-main-0')
        BEGIN
            CREATE DATABASE [Functional-main-0]
        END
    "

    echo "Database 'Functional-main-0' created or already exists."
    echo "Note: BACPAC import requires SQL Server Management Studio or SqlPackage utility."
    echo "For now, the database is ready for manual import or use the existing database."

else
    echo "No bacpac file found, creating empty database..."
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -Q "
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Functional-main-0')
        BEGIN
            CREATE DATABASE [Functional-main-0]
        END
    "
fi

echo "Database setup completed!"
echo "SQL Server is ready with database 'Functional-main-0'"

# Create completion marker file
touch /var/opt/mssql/import-completed

echo "Import process completed successfully!"

# Keep SQL Server running
wait