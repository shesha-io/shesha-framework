# One-shot bacpac importer for the compose stack.
#
# A .bacpac cannot be loaded with RESTORE DATABASE -- it needs DacFx/sqlpackage, which the
# mssql/server image does not carry. Rather than customising the SQL image, this throwaway
# container does the import once and exits; the api services wait for it via
# `depends_on: service_completed_successfully`.
#
# The test project imports the same bacpac in-process via the DacFx NuGet package
# (Infrastructure/Provisioning/BacpacImporter.cs). Two mechanisms, one artifact: the bacpac in
# shesha-functional-tests/database stays the single source of truth.

FROM mcr.microsoft.com/dotnet/sdk:8.0

# sqlpackage is installed at image build time so `docker compose up` does not pay for it.
RUN dotnet tool install -g microsoft.sqlpackage
ENV PATH="/root/.dotnet/tools:${PATH}"

COPY import.sh /usr/local/bin/import.sh
RUN chmod +x /usr/local/bin/import.sh

ENTRYPOINT ["/usr/local/bin/import.sh"]
