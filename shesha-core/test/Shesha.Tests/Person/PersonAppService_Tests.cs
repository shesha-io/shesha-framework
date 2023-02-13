using System;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using NHibernate.Linq;
using Shouldly;
using Xunit;

namespace Shesha.Tests.Users
{
    public class PersonAppService_Tests : SheshaNhTestBase
    {
        private readonly IRepository<Domain.Person, Guid> _personRepository;

        public PersonAppService_Tests()
        {
            _personRepository = Resolve<IRepository<Domain.Person, Guid>>();
        }

        /*
        [Fact]
        public async Task CreatePerson_Test()
        {
            LoginAsHostAdmin();

            var userName = "john.doe";

            await _personRepository.InsertAsync(
                new Domain.Person
                {
                    UserName = userName,
                    FirstName = "John",
                    LastName = "Doe"
                });

            await UsingDbSessionAsync(async session =>
            {
                var johnNashUser = await session.Query<Domain.Person>().FirstOrDefaultAsync(u => u.UserName == userName);
                johnNashUser.ShouldNotBeNull();
            });
        }
*/
    }
}
