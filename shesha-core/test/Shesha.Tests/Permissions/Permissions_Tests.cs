using System;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Reflection;
using Shesha.NHibernate.UoW;
using Shouldly;
using Xunit;
using Shesha.Domain;
using Shesha.Permissions;

namespace Shesha.Tests.Permissions
{
    public class Permissions_Tests : SheshaNhTestBase
    {

        private readonly IUnitOfWorkManager _unitOfWorkManager;

        private readonly IRepository<Person, Guid> _personRepository;

        public Permissions_Tests()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
        }

        [Fact]
        public async Task GetAllApi_Test()
        {
            var permissionedObjectManager = Resolve<PermissionedObjectManager>();
            var api = await permissionedObjectManager.GetAllTreeAsync();
        }

        [Fact]
        public async Task NullableColumns_Test()
        {
            /*LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var nhuow = uow as NhUnitOfWork;
                var session = nhuow?.GetSession();

                var person = _personRepository.Get(Guid.Parse("32E2B3DD-4D99-4542-AF71-134EC7C0E2CE"));

                var person2 = _personRepository.Get(Guid.Parse("0C5C3F77-8E83-43EE-B3C2-17A019F408B0"));
                person2.IsContractor = true;

                _personRepository.Update(person2);

                session.Flush();
                try
                {
                }
                finally
                {
                    // delete temporary values
                }
            }*/
        }
    }
}
