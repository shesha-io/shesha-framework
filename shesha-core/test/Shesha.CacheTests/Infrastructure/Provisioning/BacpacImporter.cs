using Microsoft.Data.SqlClient;
using Microsoft.SqlServer.Dac;

namespace Shesha.CacheTests.Infrastructure.Provisioning
{
    /// <summary>
    /// Imports the checked-in .bacpac into a SQL Server instance.
    ///
    /// A .bacpac is not a .bak -- RESTORE DATABASE cannot read it, it needs DacFx. Doing the import
    /// in-process keeps the 325 KB bacpac as the single database artifact in git, with no custom
    /// SQL image and no sqlpackage CLI dependency on the agent.
    /// </summary>
    public static class BacpacImporter
    {
        /// <summary>
        /// Locates the bacpac by walking up from the test assembly to the repo's
        /// shesha-functional-tests/database folder. Walking up rather than using a relative path
        /// keeps this working regardless of the build output depth.
        /// </summary>
        public static string ResolveBacpacPath(string? explicitPath = null)
        {
            if (!string.IsNullOrWhiteSpace(explicitPath))
            {
                return File.Exists(explicitPath)
                    ? explicitPath
                    : throw new FileNotFoundException($"Configured bacpac not found: {explicitPath}");
            }

            var dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir is not null)
            {
                var candidate = Path.Combine(dir.FullName, "shesha-functional-tests", "database");
                if (Directory.Exists(candidate))
                {
                    var bacpac = Directory.GetFiles(candidate, "*.bacpac").FirstOrDefault();
                    if (bacpac is not null)
                        return bacpac;
                }
                dir = dir.Parent;
            }

            throw new FileNotFoundException(
                "Could not locate a .bacpac under shesha-functional-tests/database. " +
                "Set Cluster:BacpacPath to point at it explicitly.");
        }

        /// <summary>
        /// Imports <paramref name="bacpacPath"/> as <paramref name="databaseName"/>.
        /// No-ops if the database already exists, so a reused container is not re-imported.
        /// </summary>
        public static async Task ImportAsync(
            string masterConnectionString,
            string bacpacPath,
            string databaseName,
            Action<string>? log = null,
            bool verbose = false,
            CancellationToken cancellationToken = default)
        {
            if (await DatabaseExistsAsync(masterConnectionString, databaseName, cancellationToken))
            {
                log?.Invoke($"database '{databaseName}' already present -- skipping import");
                return;
            }

            log?.Invoke($"importing {Path.GetFileName(bacpacPath)} -> {databaseName} ...");

            // DacServices is synchronous and CPU/IO heavy; keep it off the calling thread so the
            // fixture's async context is not blocked.
            await Task.Run(() =>
            {
                var services = new DacServices(masterConnectionString);

                // DacFx emits a Message per constraint checked -- hundreds of lines for this
                // schema, which buries everything else. Only surface them on request.
                if (log is not null && verbose)
                {
                    services.Message += (_, e) => log($"  dacfx: {e.Message}");
                    services.ProgressChanged += (_, e) => log($"  dacfx: {e.Status} {e.Message}");
                }

                using var package = BacPackage.Load(bacpacPath);
                services.ImportBacpac(package, databaseName, cancellationToken);
            }, cancellationToken);

            log?.Invoke($"import complete: {databaseName}");
        }

        private static async Task<bool> DatabaseExistsAsync(
            string masterConnectionString, string databaseName, CancellationToken cancellationToken)
        {
            await using var connection = new SqlConnection(masterConnectionString);
            await connection.OpenAsync(cancellationToken);

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT COUNT(*) FROM sys.databases WHERE name = @name";
            command.Parameters.AddWithValue("@name", databaseName);

            var count = (int)(await command.ExecuteScalarAsync(cancellationToken) ?? 0);
            return count > 0;
        }
    }
}
