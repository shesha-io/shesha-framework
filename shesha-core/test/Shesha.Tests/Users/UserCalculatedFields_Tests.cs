using Abp.Domain.Repositories;
using Newtonsoft.Json.Linq;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Binder;
using Shesha.Testing.Fixtures;
using Shouldly;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Users
{
    /// <summary>
    /// Derived fields of <see cref="User"/> (NormalizedUserName, NormalizedEmailAddress) must stay in sync when the
    /// user is saved outside of the UserManager - e.g. as a nested entity of a Person via dynamic CRUD (issue #4803).
    /// </summary>
    [Collection(SqlServerCollection.Name)]
    public class UserCalculatedFields_Tests : SheshaNhTestBase
    {
        private readonly IEntityModelBinder _entityModelBinder;
        private readonly IRepository<Person, Guid> _personRepo;
        private readonly IRepository<User, Int64> _userRepo;

        public UserCalculatedFields_Tests(SqlServerFixture fixture) : base(fixture)
        {
            _entityModelBinder = Resolve<IEntityModelBinder>();
            _personRepo = Resolve<IRepository<Person, Guid>>();
            _userRepo = Resolve<IRepository<User, Int64>>();
        }

        private async Task<(Guid personId, Int64 userId)> CreatePersonWithUserAsync(string userName, string? email, bool clearNormalizedEmail = false)
        {
            using var uow = NewNhUnitOfWork();
            var user = User.CreateUser(null, userName, email ?? "");
            user.EmailAddress = email;
            user.Password = "not-a-real-hash";
            await _userRepo.InsertAsync(user);

            var person = new Person { FirstName = userName, LastName = "Test", User = user };
            await _personRepo.InsertAsync(person);
            await uow.SaveChangesAsync();

            if (clearNormalizedEmail)
            {
                // the interceptor recalculates the field on every ORM save, so legacy NULL data can only be seeded via SQL
#pragma warning disable IDISP001 // Dispose created
                var session = uow.GetSession();
#pragma warning restore IDISP001 // Dispose created
                await session.CreateSQLQuery($"update AbpUsers set NormalizedEmailAddress = null where Id = {user.Id}").ExecuteUpdateAsync();
            }

            await uow.CompleteAsync();
            return (person.Id, user.Id);
        }

        private async Task DeleteAsync(Guid personId, Int64 userId)
        {
            using var uow = NewNhUnitOfWork();
            var person = await _personRepo.FirstOrDefaultAsync(personId);
            if (person != null)
                await _personRepo.HardDeleteAsync(person);
            var user = await _userRepo.FirstOrDefaultAsync(userId);
            if (user != null)
                await _userRepo.HardDeleteAsync(user);
            await uow.CompleteAsync();
        }

        private async Task<User> ReloadUserAsync(Int64 userId)
        {
            using var uow = NewNhUnitOfWork();
            var user = await _userRepo.GetAsync(userId);
            await uow.CompleteAsync();
            return user;
        }

        [Fact]
        public async Task NestedUserUpdate_ViaModelBinder_RecalculatesNormalizedNames_TestAsync()
        {
            LoginAsHostAdmin();
            var suffix = Guid.NewGuid().ToString("N").Substring(0, 8);
            var (personId, userId) = await CreatePersonWithUserAsync($"old{suffix}", $"old{suffix}@test.local");
            try
            {
                using (var uow = NewNhUnitOfWork())
                {
                    var person = await _personRepo.GetAsync(personId);
                    var json = $@"{{ 'id': '{personId}', 'user': {{ 'id': '{userId}', 'userName': 'New{suffix}', 'emailAddress': 'New{suffix}@Test.local' }} }}";
                    var context = new EntityModelBindingContext();

                    var result = await _entityModelBinder.BindPropertiesAsync(JObject.Parse(json), person, context);

                    result.ShouldBeTrue(string.Join("; ", context.ValidationResult.Select(e => e.ErrorMessage)));
                    person.User.ShouldNotBeNull();
                    person.User.NormalizedUserName.ShouldBe($"NEW{suffix}".ToUpperInvariant());
                    person.User.NormalizedEmailAddress.ShouldBe($"NEW{suffix}@TEST.LOCAL".ToUpperInvariant());

                    await _personRepo.UpdateAsync(person);
                    await uow.CompleteAsync();
                }

                var saved = await ReloadUserAsync(userId);
                saved.NormalizedUserName.ShouldBe($"NEW{suffix}".ToUpperInvariant());
                saved.NormalizedEmailAddress.ShouldBe($"NEW{suffix}@TEST.LOCAL".ToUpperInvariant());
            }
            finally
            {
                await DeleteAsync(personId, userId);
            }
        }

        [Fact]
        public async Task NestedUserUpdate_WithMissingNormalizedEmail_Succeeds_TestAsync()
        {
            // reproduces the seeded admin from #4803: NormalizedEmailAddress is NULL in the database
            LoginAsHostAdmin();
            var suffix = Guid.NewGuid().ToString("N").Substring(0, 8);
            var (personId, userId) = await CreatePersonWithUserAsync($"adm{suffix}", $"adm{suffix}@test.local", clearNormalizedEmail: true);
            try
            {
                (await ReloadUserAsync(userId)).NormalizedEmailAddress.ShouldBeNull();

                using (var uow = NewNhUnitOfWork())
                {
                    var person = await _personRepo.GetAsync(personId);
                    var json = $@"{{ 'id': '{personId}', 'firstName': 'Changed', 'user': {{ 'id': '{userId}', 'name': 'Changed' }} }}";
                    var context = new EntityModelBindingContext();

                    var result = await _entityModelBinder.BindPropertiesAsync(JObject.Parse(json), person, context);

                    result.ShouldBeTrue(string.Join("; ", context.ValidationResult.Select(e => e.ErrorMessage)));
                    await _personRepo.UpdateAsync(person);
                    await uow.CompleteAsync();
                }

                (await ReloadUserAsync(userId)).NormalizedEmailAddress.ShouldBe($"ADM{suffix}@TEST.LOCAL".ToUpperInvariant());
            }
            finally
            {
                await DeleteAsync(personId, userId);
            }
        }

        [Fact]
        public async Task DirectRepositoryUpdate_RecalculatesNormalizedNames_TestAsync()
        {
            // no model binder involved - covered by the NHibernate interceptor
            LoginAsHostAdmin();
            var suffix = Guid.NewGuid().ToString("N").Substring(0, 8);
            var (personId, userId) = await CreatePersonWithUserAsync($"rep{suffix}", $"rep{suffix}@test.local");
            try
            {
                using (var uow = NewNhUnitOfWork())
                {
                    var user = await _userRepo.GetAsync(userId);
                    user.UserName = $"Renamed{suffix}";
                    user.EmailAddress = $"Renamed{suffix}@Test.local";
                    await _userRepo.UpdateAsync(user);
                    await uow.CompleteAsync();
                }

                var saved = await ReloadUserAsync(userId);
                saved.NormalizedUserName.ShouldBe($"RENAMED{suffix}".ToUpperInvariant());
                saved.NormalizedEmailAddress.ShouldBe($"RENAMED{suffix}@TEST.LOCAL".ToUpperInvariant());
            }
            finally
            {
                await DeleteAsync(personId, userId);
            }
        }
    }
}
