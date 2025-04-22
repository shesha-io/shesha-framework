using Abp.Domain.Repositories;
using Moq;
using NHibernate;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.NHibernate;
using Shesha.NHibernate.Repositories;
using Shesha.Specifications;
using Shesha.Tests.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Specifications
{
    [Collection(SqlServerCollection.Name)]
    public class Specifications_Tests : SheshaNhTestBase
    {
        public Specifications_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task Test_NestedContexts_Async()
        {
            var globalSpecsManager = new Mock<ISpecificationsFinder>();
            globalSpecsManager.Setup(s => s.GlobalSpecifications).Returns(new List<ISpecificationInfo>());
            var specAccessor = new SpecificationManager(globalSpecsManager.Object);

            specAccessor.SpecificationTypes.ShouldBeEmpty();

            await Task.Delay(1);

            using (specAccessor.Use<Age18PlusSpecification, Person>())
            {
                await Task.Delay(1);

                specAccessor.SpecificationTypes.ShouldBe(new[] { typeof(Age18PlusSpecification) }, ignoreOrder: true);

                using (specAccessor.Use<HasNoAccountSpecification, Person>())
                {
                    await Task.Delay(1);

                    specAccessor.SpecificationTypes.ShouldBe(new[] { typeof(Age18PlusSpecification), typeof(HasNoAccountSpecification) }, ignoreOrder: true);
                }

                await Task.Delay(1);

                specAccessor.SpecificationTypes.ShouldBe(new[] { typeof(Age18PlusSpecification) }, ignoreOrder: true);
            }

            await Task.Delay(1);

            specAccessor.SpecificationTypes.ShouldBeEmpty();
        }

        [Fact]
        public async Task Test_NestedContexts_Fetch_Async()
        {
            var testPersons = new List<Person> {
                TestPerson("John", "Doe", new DateTime(2001, 01, 01), "John.Doe"),
                TestPerson("Bill", "Gates", new DateTime(2004, 02, 11), null),
                TestPerson("Merylin", "Manson", new DateTime(2011, 05, 17), null),
                TestPerson("Bob", "Sponge", new DateTime(2007, 02, 21), "Bob.Sponge"),
                TestPerson("Fredy", "Kruger", new DateTime(2019, 03, 15), "Fredy.Kruger"),
                TestPerson("Ivan", "Drago", new DateTime(2002, 04, 01), "Ivan.Drago"),
            };

            var sessionMoq = new Mock<ISession>();
            sessionMoq.Setup(s => s.Query<Person>()).Returns(() => testPersons.AsQueryable());

            var sessionProviderMoq = new Mock<ISessionProvider>();
            sessionProviderMoq.Setup(s => s.Session).Returns(() => sessionMoq.Object);

            var repository = Resolve<NhRepositoryBase<Person, Guid>>(new { sessionProvider = sessionProviderMoq.Object }) as IRepository<Person, Guid>;

            // prepare expected values
            var expectedAllPersonsCount = testPersons.Count();
            var expectedPersons18Plus = testPersons.Where(p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18)).ToList();
            var expectedPersons18PlusWithoutAccount = testPersons.Where(p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18) && p.User == null).ToList();

            var globalSpecsManager = new Mock<ISpecificationsFinder>();
            globalSpecsManager.Setup(s => s.GlobalSpecifications).Returns(new List<ISpecificationInfo>());
            var specAccessor = new SpecificationManager(globalSpecsManager.Object);

            specAccessor.SpecificationTypes.ShouldBeEmpty();

            await Task.Delay(1);

            var allPersonsCount = await repository.GetAll().CountAsync();
            allPersonsCount.ShouldBe(expectedAllPersonsCount);

            using (specAccessor.Use<Age18PlusSpecification, Person>())
            {
                await Task.Delay(1);

                specAccessor.SpecificationTypes.ShouldBe(new[] { typeof(Age18PlusSpecification) }, ignoreOrder: true);

                var persons18Plus = await repository.GetAll().ToListAsync();
                persons18Plus.ShouldBe(expectedPersons18Plus, ignoreOrder: true);

                using (specAccessor.Use<HasNoAccountSpecification, Person>())
                {
                    await Task.Delay(1);

                    specAccessor.SpecificationTypes.ShouldBe(new[] { typeof(Age18PlusSpecification), typeof(HasNoAccountSpecification) }, ignoreOrder: true);
                    
                    var persons18PlusWithoutAccount = await repository.GetAll().ToListAsync();
                    persons18PlusWithoutAccount.ShouldBe(expectedPersons18PlusWithoutAccount, ignoreOrder: true);
                }

                await Task.Delay(1);

                specAccessor.SpecificationTypes.ShouldBe(new[] { typeof(Age18PlusSpecification) }, ignoreOrder: true);

                var persons18Plus2 = await repository.GetAll().ToListAsync();
                persons18Plus2.ShouldBe(expectedPersons18Plus, ignoreOrder: true);
            }

            await Task.Delay(1);

            specAccessor.SpecificationTypes.ShouldBeEmpty();
            
            var allPersonsCount2 = await repository.GetAll().CountAsync();
            allPersonsCount2.ShouldBe(expectedAllPersonsCount);
        }

        private Person TestPerson(string firstName, string lastName, DateTime? dob, string? username)
        {
            return new Person {
                Id = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = dob,
                User = !string.IsNullOrWhiteSpace(username)
                    ? new Authorization.Users.User() 
                        {
                            UserName = username
                        }
                    : null
            };
        }
    }
}
