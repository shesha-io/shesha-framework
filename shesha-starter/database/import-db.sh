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

# Check if bacpac file exists and import
if [ -f /var/opt/mssql/backup/ShaProjectName.bacpac ]; then
    echo "Found ShaProjectName.bacpac file ($(du -h /var/opt/mssql/backup/ShaProjectName.bacpac | cut -f1))"
    echo "Importing BACPAC using SqlPackage..."

    # Set up .NET environment and run sqlpackage
    export DOTNET_ROOT=/usr/local/share/dotnet
    export PATH="$PATH:/usr/local/share/dotnet:/root/.dotnet/tools"

    /root/.dotnet/tools/sqlpackage /Action:Import \
        /SourceFile:/var/opt/mssql/backup/ShaProjectName.bacpac \
        /TargetConnectionString:"Server=localhost,1433;Initial Catalog=Functional-main-0;Persist Security Info=False;User ID=sa;Password=$MSSQL_SA_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30;"

    if [ $? -eq 0 ]; then
        echo "BACPAC import completed successfully!"
        echo "Database 'Functional-main-0' is ready with imported data."
    else
        echo "BACPAC import failed, creating empty database as fallback..."
        /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -Q "
            IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Functional-main-0')
            BEGIN
                CREATE DATABASE [Functional-main-0]
            END
        "
    fi
else
    echo "No ShaProjectName.bacpac file found, creating empty database..."
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