using System.Threading.Tasks;
using Testcontainers.PostgreSql;
using Xunit;

namespace Shesha.Tests.Fixtures
{
    [Collection("Sequential")]
    public class PostgreSqlFixture : IDatabaseFixture, IAsyncLifetime
    {
        private const string Login = "postgres";
        private const string Password = "postgres";
        private const string DbName = "TestDB";

        private readonly PostgreSqlContainer _postgresContainer;

        public string ConnectionString { get; private set; }

        public DbmsType DbmsType => DbmsType.PostgreSQL;

        public PostgreSqlFixture()
        {
            // Configure the PostgreSQL container
            _postgresContainer = new PostgreSqlBuilder()
                .WithImage("boxfusionregistry.azurecr.io/shesha-framework-postgresql:1.0") // Use the latest PostgreSQL image
                .WithDatabase(DbName) // Set the database name
                .WithUsername(Login) // Set the username
                .WithPassword(Password) // Set the password
                .WithExposedPort(5432) // Expose the default PostgreSQL port
                .Build();
        }

        public async Task InitializeAsync()
        {
            // Start the container and initialize the connection string
            await _postgresContainer.StartAsync();
            ConnectionString = $"Host=127.0.0.1;Port={_postgresContainer.GetMappedPublicPort(5432)};Database={DbName};Username={Login};Password={Password};";
        }

        public async Task DisposeAsync()
        {
            // Stop and remove the container
            await _postgresContainer.StopAsync();
        }
    }
}
