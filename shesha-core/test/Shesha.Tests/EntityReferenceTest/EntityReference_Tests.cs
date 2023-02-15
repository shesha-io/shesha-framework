using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.EntityReferences;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
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

        public EntityReference_Tests()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
            _organisationRepository = Resolve<IRepository<Organisation, Guid>>();
            //_entityRefRepository = Resolve<IRepository<EntityRef, Guid>>();
            _jsonStringRepository = Resolve<IRepository<ComplexTestString, Guid>>();
            //_jsonPersonRepository = Resolve<IRepository<ComplexPersonTest, Guid>>();
            _entityModelBinder = Resolve<IEntityModelBinder>();
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