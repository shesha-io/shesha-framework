# Shesha.Testing

Reusable integration test infrastructure for Shesha framework applications.

Provides base classes, xUnit fixtures, and helpers for writing NHibernate-backed integration tests against ABP modules.

## Key Components

- **`ShaIntegratedTestBase<TStartupModule>`** - ABP test base with IoC, UoW helpers, and `Resolve<T>()`
- **`SheshaNhTestBase<TStartupModule>`** - NHibernate test base with session helpers and login helpers
- **`SheshaTestModuleHelper.ConfigureForTesting()`** - Extension method that configures common test module boilerplate
- **Database Fixtures** - `LocalSqlServerFixture`, `SqlServerFixture` (Testcontainers), `PostgreSqlFixture` (Testcontainers)
- **`UnitTestHelper`** - Mock helpers for `IWebHostEnvironment`, API explorer, and fake service registration
