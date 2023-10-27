using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Timing;
using DocumentFormat.OpenXml.Vml.Office;
using Newtonsoft.Json;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.NHibernate;
using Shesha.NHibernate.Session;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Principal;
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
        //private readonly IRepository<EntityRef, Guid> _entityRefRepository;
        private readonly IRepository<ComplexTestString, Guid> _jsonStringRepository;
        //private readonly IRepository<ComplexPersonTest, Guid> _jsonPersonRepository;
        private readonly IEntityModelBinder _entityModelBinder;
        private readonly IRepository<Module, Guid> _moduleRepo;

        public EntityReference_Tests()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
            _organisationRepository = Resolve<IRepository<Organisation, Guid>>();
            //_entityRefRepository = Resolve<IRepository<EntityRef, Guid>>();
            _jsonStringRepository = Resolve<IRepository<ComplexTestString, Guid>>();
            //_jsonPersonRepository = Resolve<IRepository<ComplexPersonTest, Guid>>();
            _entityModelBinder = Resolve<IEntityModelBinder>();

            _moduleRepo = Resolve<IRepository<Module, Guid>>();
        }

        private static EntityIdentifier GetEntityIdentifier(GenericEntityReference genericEntity)
        {
            EntityIdentifier entityIdentifier = null;

            Entity<Guid> entity = genericEntity;

            if (entity is not null)
            {
                entityIdentifier = new EntityIdentifier(entity.GetType(), entity.Id);
            }

            return entityIdentifier;
        }

        [Fact]
        public async Task TestGnericEntityReferenceConvert()
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
        public async Task TestGnericEntityReference()
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
                    var entry = session?.GetEntry(item, false);
                    var dirty = session.GetDirtyProperties(item);
                }

            await uow.CompleteAsync();
            }
        }

        [Fact]
        public async Task CheckUow()
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

        /*        [Table("Test_EntityRef")]
                public class EntityRef : Entity<Guid>
                {
                    public GenericEntityReference AnyEntity { get; set; }

                    public GenericEntityReference MyEntity { get; set; }

                }

                [Fact]
                public async Task CheckUserType()
                {
                    LoginAsHostAdmin();

                    using (var uow = _unitOfWorkManager.Begin())
                    {
                        EntityRef er = _entityRefRepository.GetAll().FirstOrDefault();

                        Entity<Guid> anyEntity = er.AnyEntity;

                        if (anyEntity is Person person)
                        {

                        }
                        if (anyEntity is Organisation organisation)
                        {

                        }

                        var entity = (Person)er.AnyEntity;

                        if (anyEntity is Person person2)
                        {
                            var name = person2.FullName;
                        }

                        var org = _organisationRepository.GetAll().FirstOrDefault();

                        GenericEntityReference eref = org;
                        er.AnyEntity = org;
                        _entityRefRepository.InsertOrUpdate(er);

                        uow.Complete();
                    }
                }

                [Fact]
                public async Task CheckMuliProp()
                {
                    LoginAsHostAdmin();

                    using (var uow = _unitOfWorkManager.Begin())
                    {
                        EntityRef er = _entityRefRepository.GetAll().FirstOrDefault();

                        Entity<Guid> anyEntity = er.AnyEntity;

                        er.MyEntity = anyEntity;

                        _entityRefRepository.InsertOrUpdate(er);

                        uow.Complete();
                    }
                }
        */
    }
}