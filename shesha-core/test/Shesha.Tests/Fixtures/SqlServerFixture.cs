using System.Threading.Tasks;
using Testcontainers.MsSql;
using Xunit;

namespace Shesha.Tests.Fixtures
{
    public class SqlServerFixture : IDatabaseFixture, IAsyncLifetime
    {
        private const string Login = "sa";
        private const string Password = "YourStrong!Passw0rd";
        private const string DbName = "TestDB";

        private readonly MsSqlContainer _mssqlContainer;
        public string ConnectionString { get; private set; }

        public DbmsType DbmsType => DbmsType.SQLServer;

        public SqlServerFixture()
        {
            // Configure the SQL Server container
            _mssqlContainer = new MsSqlBuilder()
                .WithImage("boxfusionregistry.azurecr.io/shesha-framework-mssql:1.0") // Specify the SQL Server image
                .WithPassword(Password) // Set the SA password
                .WithExposedPort(1433) // Expose the default SQL Server port
                .Build();
        }

        public async Task InitializeAsync()
        {
            // Start the container and initialize the connection string
            await _mssqlContainer.StartAsync();
            ConnectionString = $"Server=127.0.0.1,{_mssqlContainer.GetMappedPublicPort(1433)};Database={DbName};User Id={Login};Password={Password};TrustServerCertificate=True;";
        }

        public Task DisposeAsync()
        {
            // Stop and remove the container
            return _mssqlContainer.StopAsync();
        }
    }
}
