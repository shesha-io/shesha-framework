using Newtonsoft.Json;
using NHibernate.Dialect;
using NHibernate.Driver;
using Shesha.NHibernate.Filters;
using Shesha.NHibernate.Maps;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.UserTypes;
using Shouldly;
using System;
using Xunit;

namespace Shesha.Tests.DomainAttributes
{
    public class JsonUserType_Tests: SheshaNhTestBase
    {
        [Fact]
        public void Should_Assemble()
        {
            var person = new PersonEntity
            {
                Name = "Someone special",
                HomeAddress = new Address
                {
                    Street = "24 Fitter Rd",
                    Town = "Cresslawn",
                    PostalCode = 1619
                }
            };
            var jsonifiedPerson = JsonConvert.SerializeObject(person);

            var userType = new JsonUserType<PersonEntity>();
            var deserialized = (PersonEntity) userType.Assemble(jsonifiedPerson, null);

            Assert.NotNull(deserialized);
            Assert.Equal(person.Name, deserialized.Name);
            Assert.Equal(person.HomeAddress.Street, deserialized.HomeAddress.Street);
            Assert.Equal(person.HomeAddress.PostalCode, deserialized.HomeAddress.PostalCode);
            Assert.Equal(person.HomeAddress.Coordinates, deserialized.HomeAddress.Coordinates);
        }

        [Fact]
        public void Should_Disassemble()
        {
            var person = new PersonEntity
            {
                Name = "Someone special",
                HomeAddress = new Address
                {
                    Street = "24 Fitter Rd",
                    Town = "Cresslawn",
                    PostalCode = 1619
                }
            };

            var userType = new JsonUserType<PersonEntity>();
            var serialized = userType.Disassemble(person);

            Assert.NotNull(serialized);
            Assert.IsType<string>(serialized);
            Assert.Contains("Street", serialized.ToString());
        }

        [Fact]
        public void Should_SavePropertyAsJSON()
        {
            var person = new PersonEntity
            {
                Name = "Someone special",
                HomeAddress = new Address
                {
                    Street = "24 Fitter Rd",
                    Town = "Cresslawn",
                    PostalCode = 1619,
                    Coordinates = new GeometricCoordinates
                    {
                        Latitude = 24.01256,
                        Longitude = -23.12533
                    }
                },
                OfficeAddress = new Address
                {
                    Street = "265 West Avenue",
                    Town = "Die Howes",
                    PostalCode = 1002,
                    Coordinates = new GeometricCoordinates
                    {
                        Latitude = 24.123654,
                        Longitude = -23.452365
                    }
                }
                
            };
            var personAssembly = person.GetType().Assembly;

            var conventions = new Conventions();
            conventions.AddAssembly(personAssembly, "Test_");

            var nhConfig = new global::NHibernate.Cfg.Configuration();
            nhConfig.DataBaseIntegration(db =>
            {
                db.ConnectionString = @"Data Source=.\MSSQLSERVER2019;Initial Catalog=DsdNpo;User ID=sa;password=1;MultipleActiveResultSets=True";

                db.Dialect<MsSql2012Dialect>();
                db.Driver<Sql2008ClientDriver>();
                db.Timeout = 150;
                db.LogFormattedSql = true;
            })
                    .SetProperty("hbm2ddl.keywords", "auto-quote")
                    .CurrentSessionContext<UnitOfWorkSessionContext>();

            nhConfig.AddFilterDefinition(SoftDeleteFilter.GetDefinition());
            nhConfig.AddFilterDefinition(MayHaveTenantFilter.GetDefinition());
            nhConfig.AddFilterDefinition(MustHaveTenantFilter.GetDefinition());

            conventions.Compile(nhConfig);

            var sessionFactory = nhConfig.BuildSessionFactory();

            using (var session = sessionFactory.OpenSession())
            {
                session.SaveOrUpdate(person);
                session.Flush();
                
                person.Id.ShouldNotBe(Guid.Empty);


                var homeQuery = @"select HomeAddress from Test_PersonEntities where Id=:id";

                var dbItem = session.CreateSQLQuery(homeQuery)
                                   .SetGuid("id", person.Id)
                                   .UniqueResult<string>();
                var homeJsonStr = JsonConvert.SerializeObject(person.HomeAddress);
                
                Assert.Equal(dbItem, homeJsonStr);

                // Check the office address while I'm at it
                var officeQuery = @"select OfficeAddress from Test_PersonEntities where Id=:id";
                var officeAddr = session.CreateSQLQuery(officeQuery)
                                   .SetGuid("id", person.Id)
                                   .UniqueResult<string>();
                var officeJsonStr = JsonConvert.SerializeObject(person.OfficeAddress);
                Assert.Equal(officeAddr, officeJsonStr);    

                // Checking the get method to see if it's deserializing correctly
                var entityItem = session.Get<PersonEntity>(person.Id);
                Assert.NotEqual(default, entityItem.Id);

                Assert.Equal(person.HomeAddress, entityItem.HomeAddress);
                Assert.Equal(person.OfficeAddress, entityItem.OfficeAddress);
            }
        }
    }
}
