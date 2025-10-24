# SQL Server Database Import Container
FROM mcr.microsoft.com/mssql/server:2022-latest

# Set environment variables
ENV ACCEPT_EULA=Y
ENV MSSQL_SA_PASSWORD=@123Shesha
ENV MSSQL_PID=Developer

# Install sqlcmd tools
USER root
RUN apt-get update && apt-get install -y \
    curl \
    apt-transport-https \
    gnupg \
    lsb-release

# Install Microsoft repository
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" > /etc/apt/sources.list.d/microsoft.list

# Install sqlcmd and bcp tools
RUN apt-get update && apt-get install -y mssql-tools unixodbc-dev \
    && echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

# Copy database backup files
COPY *.bacpac /var/opt/mssql/backup/
COPY *.backup /var/opt/mssql/backup/

# Copy import script
COPY import-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/import-db.sh

# Expose SQL Server port
EXPOSE 1433

# Set the entry point to start SQL Server with our custom script
ENTRYPOINT ["/usr/local/bin/import-db.sh"]