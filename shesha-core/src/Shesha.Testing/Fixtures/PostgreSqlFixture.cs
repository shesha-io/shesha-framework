using System.Threading.Tasks;
using Testcontainers.PostgreSql;
using Xunit;

namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// xUnit fixture that spins up a PostgreSQL Docker container via Testcontainers.
    /// </summary>
    [Collection("Sequential")]
    public class PostgreSqlFixture : IDatabaseFixture, IAsyncLifetime
    {
        private const string Login = "postgres";
        private const string Password = "postgres";
        private const string DbName = "TestDB";

        private readonly PostgreSqlContainer _postgresContainer;

        public string ConnectionString { get; private set; } = default!;

        public DbmsType DbmsType => DbmsType.PostgreSQL;

        public PostgreSqlFixture()
        {
            _postgresContainer = new PostgreSqlBuilder()
                .WithImage("boxfusionregistry.azurecr.io/shesha-framework-postgresql:1.0")
                .WithDatabase(DbName)
                .WithUsername(Login)
                .WithPassword(Password)
                .WithExposedPort(5432)
                .Build();
        }

        public async Task InitializeAsync()
        {
            await _postgresContainer.StartAsync();
            ConnectionString = $"Host=127.0.0.1;Port={_postgresContainer.GetMappedPublicPort(5432)};Database={DbName};Username={Login};Password={Password};";
        }

        public async Task DisposeAsync()
        {
            await _postgresContainer.StopAsync();
        }
    }
}
