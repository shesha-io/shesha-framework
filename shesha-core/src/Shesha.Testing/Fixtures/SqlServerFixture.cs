using System.Threading.Tasks;
using Testcontainers.MsSql;
using Xunit;

namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// xUnit fixture that spins up a SQL Server Docker container via Testcontainers.
    /// </summary>
    public class SqlServerFixture : IDatabaseFixture, IAsyncLifetime
    {
        private const string Login = "sa";
        private const string Password = "YourStrong!Passw0rd";
        private const string DbName = "TestDB";

        private readonly MsSqlContainer _mssqlContainer;
        public string ConnectionString { get; private set; } = default!;

        public DbmsType DbmsType => DbmsType.SQLServer;

        public SqlServerFixture()
        {
            _mssqlContainer = new MsSqlBuilder()
                .WithImage("iilyichev/shesha-framework-mssql:0.43") // Specify the SQL Server image
                .WithPassword(Password) // Set the SA password
                .WithExposedPort(1433) // Expose the default SQL Server port
                .Build();
        }

        public async Task InitializeAsync()
        {
            await _mssqlContainer.StartAsync();
            ConnectionString = $"Server=127.0.0.1,{_mssqlContainer.GetMappedPublicPort(1433)};Database={DbName};User Id={Login};Password={Password};TrustServerCertificate=True;";
        }

        public Task DisposeAsync()
        {
            return _mssqlContainer.StopAsync();
        }
    }
}
