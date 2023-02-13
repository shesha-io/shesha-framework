using Abp.Domain.Entities;
using Abp.TestBase;
using NHibernate.Cfg;
using NHibernate.Dialect;
using NHibernate.Driver;
using Shesha.DynamicEntities;
using Shesha.Migrations;
using Shesha.NHibernate.Filters;
using Shesha.NHibernate.Maps;
using Shesha.NHibernate.Session;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DynamicEntities
{
    public class DynamicEntity_Tests : AbpIntegratedTestBase<SheshaTestModule>//SheshaNhTestBase
    {
        //[Fact]
        public async Task ConstructDynamicEntity_Test()
        {
            try 
            {
                const string firstNamePropName = "FirstName";

                var dynamicEntityMeta = new DynamicEntity
                {
                    Name = "DynamicPerson",
                    Properties = new DynamicPropertyList
                {
                    { "Id", typeof(Guid) },
                    { firstNamePropName, typeof(string) },
                    { "LastName", typeof(string) },
                    { "Age", typeof(int) },
                    { "BirthDate", typeof(DateTime?) },
                }
                };

                var dynamicPersonType = ShaEntityTypeBuilder.CompileResultType(dynamicEntityMeta);
                var dynamicPerson = Activator.CreateInstance(dynamicPersonType);

                dynamicPerson.ShouldNotBeNull();

                var firstNameTestValue = "John";
                var propInfo = dynamicPerson.GetType().GetProperty(firstNamePropName);
                propInfo.SetValue(dynamicPerson, firstNameTestValue);

                var firstNameValue = propInfo.GetValue(dynamicPerson);

                firstNameValue.ShouldBe(firstNameTestValue);

                var nhConfig = new global::NHibernate.Cfg.Configuration();
                nhConfig.DataBaseIntegration(db =>
                {
                    db.ConnectionString = @"Data Source=.\sql2019;Initial Catalog=SheshaDemo;Integrated Security=True";

                    db.Dialect<MsSql2012Dialect>();
                    db.Driver<Sql2008ClientDriver>();
                    db.Timeout = 150;
                    db.LogFormattedSql = true;
                })
                        .SetProperty("hbm2ddl.keywords", "auto-quote")
                        .CurrentSessionContext<UnitOfWorkSessionContext>();

                // register filters
                nhConfig.AddFilterDefinition(SoftDeleteFilter.GetDefinition());
                nhConfig.AddFilterDefinition(MayHaveTenantFilter.GetDefinition());
                nhConfig.AddFilterDefinition(MustHaveTenantFilter.GetDefinition());

                var conventions = new Conventions();
                var dynamicPersonAssembly = dynamicPerson.GetType().Assembly;
                conventions.AddAssembly(dynamicPersonAssembly, "Test_");
                conventions.Compile(nhConfig);

                var sessionFactory = nhConfig.BuildSessionFactory();

                var migrationsGenerator = LocalIocManager.Resolve<IMigrationGenerator>();
                var migration = migrationsGenerator.GenerateMigrations(new List<Type> { dynamicPersonType });

                using (var session = sessionFactory.OpenSession())
                {
                    // save our person
                    session.SaveOrUpdate(dynamicPerson);
                    session.Flush();
                    var person = dynamicPerson as Entity<Guid>;
                    person.ShouldNotBeNull();
                    person.Id.ShouldNotBe(Guid.Empty);

                    var query = session.CreateQuery($"select ent from {dynamicPersonType.FullName} ent");
                    var items = query.List();
                    items.Count.ShouldBeGreaterThan(0);

                    var fetchedPerson = session.Get(dynamicPersonType, person.Id) as Entity<Guid>;
                    fetchedPerson.ShouldNotBeNull();
                    fetchedPerson.Id.ShouldBe(person.Id);
                }
            }
            catch (Exception e) 
            {
                throw;
            }
        }
    }
}
