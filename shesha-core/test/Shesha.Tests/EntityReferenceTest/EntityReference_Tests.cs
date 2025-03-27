using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Json;
using Abp.Timing;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.NHibernate;
using Shesha.NHibernate.Session;
using System;
using System.Threading.Tasks;
using Xunit;
using static Shesha.Tests.JsonEntity.JsonEntity_Tests;

namespace Shesha.Tests.EntityReferenceTest
{
    public class EntityReference_Tests : SheshaNhTestBase
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<Organisation, Guid> _organisationRepository;
        private readonly IRepository<ComplexTestString, Guid> _jsonStringRepository;
        private readonly IEntityModelBinder _entityModelBinder;
        private readonly IRepository<Module, Guid> _moduleRepo;

        public EntityReference_Tests()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
            _organisationRepository = Resolve<IRepository<Organisation, Guid>>();
            _jsonStringRepository = Resolve<IRepository<ComplexTestString, Guid>>();
            _entityModelBinder = Resolve<IEntityModelBinder>();

            _moduleRepo = Resolve<IRepository<Module, Guid>>();
        }

        public class TestDto
        {
            public string Name { get; set; }
            public GenericEntityReference Test { get; set; }
        }

        [Fact]
        public async Task TestGnericEntityReferenceSerializationAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var person = await _personRepository.GetAll().FirstOrDefaultAsync(x => x.FirstName != null && x.FirstName != "");
                var dto = new TestDto
                {
                    Name = "Test",
                    Test = person
                };

                var json = dto.ToJsonString();
                var obj = json.FromJsonString<TestDto>();

                var newTest = (Person)obj.Test;

                Assert.True(newTest.FirstName?.Equals(person.FirstName));
            }
        }

        [Fact]
        public async Task TestGnericEntityReferenceConvertAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                GenericEntityReference i = new GenericEntityReference("32E2B3DD-4D99-4542-AF71-134EC7C0E2CE", "Shesha.Domain.Person");
                //i = new Person();

                Entity<Guid> e = i;

                var t = e.GetType();
                var id = e.Id;
                await uow.CompleteAsync();
            }
        }

        [Fact]
        public async Task TestGnericEntityReferenceAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {

                var repo = LocalIocManager.Resolve<IRepository<ShaRoleAppointedPerson, Guid>>();
                var items = await repo.GetAllListAsync();

                var sessionProvider = LocalIocManager.Resolve<ISessionProvider>();
                var session = sessionProvider.Session;

                //GenericEntityReference i = null;

                foreach (var item in items)
                {
                    //var b = i == item.PermissionedEntity1;
                    //i = item.PermissionedEntity1;
                    var entry = session.GetEntryOrNull(item);
                    var dirty = session.GetDirtyProperties(item);
                }

            await uow.CompleteAsync();
            }
        }

        [Fact]
        public async Task CheckUowAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin(new UnitOfWorkOptions
            {
                IsTransactional = true,
                IsolationLevel = System.Transactions.IsolationLevel.ReadUncommitted
            }))
            {
                var dbModules = await _moduleRepo.GetAll().ToListAsync();

                var dbModule = new Module
                {
                    Name = "Test",
                    FriendlyName = "Test",
                    Description = "Test",
                    Publisher = "Test",
                    IsEditable = true,
                    IsRootModule = true,
                    IsEnabled = true,

                    CurrentVersionNo = "1",
                    FirstInitializedDate = Clock.Now,
                };
                await _moduleRepo.InsertAsync(dbModule);

                await _unitOfWorkManager.Current.SaveChangesAsync();

                var dbModules2 = await _moduleRepo.GetAllListAsync();

                await uow.CompleteAsync();
            }
        }
    }
}