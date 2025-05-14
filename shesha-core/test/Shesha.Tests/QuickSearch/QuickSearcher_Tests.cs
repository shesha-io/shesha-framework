using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Linq;
using Abp.Runtime.Caching;
using FluentAssertions;
using Moq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.QuickSearch;
using Shesha.QuickSearch.Cache;
using Shesha.Services;
using Shesha.Tests.Fixtures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.QuickSearch
{
    /// <summary>
    /// Tests for <see cref="QuickSearcher"/>
    /// </summary>
    [Collection(SqlServerCollection.Name)]
    public class QuickSearcher_Tests : SheshaNhTestBase
    {
        public QuickSearcher_Tests(SqlServerFixture fixture) : base(fixture)
        {
            
        }

        [Fact]
        public void SearchPerson_TextFields_Convert_Test()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<Person>("test", new List<string> {
                nameof(Person.FirstName),
                nameof(Person.LastName),
                $"{nameof(Person.User)}.{nameof(Person.User.UserName)}"
            });

            Assert.Equal(@"ent => ((ent.FirstName.Contains(""test"") OrElse ent.LastName.Contains(""test"")) OrElse ent.User.UserName.Contains(""test""))", expression.ToString());
        }

        [Fact]
        public async Task SearchPerson_TextFields_Fetch_TestAsync()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<Person>("test", new List<string> {
                nameof(Person.FirstName),
                nameof(Person.LastName),
                $"{nameof(Person.User)}.{nameof(Person.User.UserName)}"
            });

            await TryFetchDataAsync<Person, Guid>(query => query.Where(expression), data => {
                // check data
            });
        }

        [Fact]
        public void SearchTestPerson_TextFields_Convert_Test()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<TestPerson>("test", new List<string> {
                nameof(TestPerson.FirstName),
                nameof(TestPerson.LastName),
                $"{nameof(TestPerson.Organisation)}.{nameof(TestPerson.Organisation.Name)}"
            });

            Assert.Equal(@"ent => ((ent.FirstName.Contains(""test"") OrElse ent.LastName.Contains(""test"")) OrElse ent.Organisation.Name.Contains(""test""))", expression.ToString());
        }

        [Fact]
        public void SearchTestPerson_TextFields_NestedEntity_Convert_Test()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<TestPerson>("test", new List<string> {
                nameof(TestPerson.FirstName),
                nameof(TestPerson.LastName),
                nameof(TestPerson.Organisation)
            });

            Assert.Equal(@"ent => ((ent.FirstName.Contains(""test"") OrElse ent.LastName.Contains(""test"")) OrElse ent.Organisation.Name.Contains(""test""))", expression.ToString());
        }

        [Fact]
        public void SearchTestPerson_RefList_Convert_Test()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<TestPerson>("mrs", new List<string> {
                nameof(TestPerson.Title)
            });

            var refListId = GetReflistId(new ReferenceListIdentifier(null, "Shesha.Core", "PersonTitles"));
            
            var expected = $@"ent => value(NHibernate.Linq.NhQueryable`1[Shesha.Domain.ReferenceListItem]).Any(entTitle => (((entTitle.ReferenceList.Id == {refListId}) AndAlso (Convert(ent.Title, Nullable`1) == Convert(entTitle.ItemValue, Nullable`1))) AndAlso entTitle.Item.Contains(""mrs"")))";

            Assert.Equal(expected, expression.ToString());
        }

        private Guid? GetReflistId(ReferenceListIdentifier refListId) 
        {
            var refListHelper = Resolve<IReferenceListHelper>();
            Guid? id = null;
            WithUnitOfWork(() =>
            {
                var refList = refListHelper.GetReferenceList(refListId);
                id = refList?.Id;
            });
            return id;
        }

        [Fact]
        public async Task SearchTestPerson_RefList_Fetch_TestAsync()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<Person>("mrs", new List<string> {
                nameof(TestPerson.Title)
            });

            await TryFetchDataAsync<Person, Guid>(query => query.Where(expression), data => {
                // check data
            });
        }

        [Fact]
        public void SearchTest_Organisation_MultiValueRefList_Convert_Test()
        {
            var quickSearcher = Resolve<QuickSearcher>();

            var expression = quickSearcher.GetQuickSearchExpression<TestOrganisation>("email", new List<string> {
                nameof(TestOrganisation.ContactMethods)
            });

            var refListId = GetReflistId(new ReferenceListIdentifier("Shesha", "Shesha.Core", "PreferredContactMethod"));

            Assert.Equal($@"ent => value(NHibernate.Linq.NhQueryable`1[Shesha.Domain.ReferenceListItem]).Any(entContactMethods => (((entContactMethods.ReferenceList.Id == {refListId}) AndAlso ((Convert(ent.ContactMethods, Nullable`1) & Convert(entContactMethods.ItemValue, Nullable`1)) > Convert(0, Nullable`1))) AndAlso entContactMethods.Item.Contains(""email"")))", expression.ToString());
        }

        [Fact]
        public void SearchTest_Organisation_MultiValueRefList_Fetch_Test()
        {
            var orgRepoMock = new Mock<IRepository<TestOrganisation, Guid>>();

            var testOrganisations = new List<TestOrganisation> {
                new TestOrganisation { Id = Guid.NewGuid(), Name = "Boxfusion", ContactMethods = (Int64)(TestContactMethod.Email | TestContactMethod.Sms | TestContactMethod.Fax) },
                new TestOrganisation { Id = Guid.NewGuid(), Name = "Microsoft", ContactMethods = (Int64)(TestContactMethod.Email | TestContactMethod.Fax) },
                new TestOrganisation { Id = Guid.NewGuid(), Name = "Google", ContactMethods = (Int64)(TestContactMethod.Fax | TestContactMethod.Sms) },
                new TestOrganisation { Id = Guid.NewGuid(), Name = "Hali-Gali Comp", ContactMethods = (Int64)(TestContactMethod.Fax) },
                new TestOrganisation { Id = Guid.NewGuid(), Name = "Supa-Drupa Int", ContactMethods = (Int64)(TestContactMethod.Email | TestContactMethod.Sms) },
            };

            orgRepoMock.Setup(s => s.GetAll()).Returns(() => testOrganisations.AsQueryable());

            var refList = new ReferenceList {
                Id = Guid.NewGuid(),
                Namespace = "Shesha.Core",
                Name = "PreferredContactMethod",
                Module = new Domain.ConfigurationItems.Module { Name = "Shesha" }
            };
            var refListItems = new List<ReferenceListItem>();
            var enumValues = Enum.GetValues(typeof(TestContactMethod));
            foreach (var enumValue in enumValues)
            {
                refListItems.Add(new ReferenceListItem
                {
                    Id = Guid.NewGuid(),
                    ReferenceList = refList,
                    Item = Enum.GetName(typeof(TestContactMethod), enumValue),
                    ItemValue = (Int64)enumValue
                });
            }

            var rliRepoMock = new Mock<IRepository<ReferenceListItem, Guid>>();
            rliRepoMock.Setup(s => s.GetAll()).Returns(() => refListItems.AsQueryable());

            var refListHelperRepoMock = new Mock<IReferenceListHelper>();
            refListHelperRepoMock.Setup(s => s.GetReferenceList(It.IsAny<ReferenceListIdentifier>())).Returns<ReferenceListIdentifier>((id) => {
                return refList;
            });

            var quickSearchPropertiesCacheHolder = Resolve<IQuickSearchPropertiesCacheHolder>();
            var quickSearcher = new QuickSearcher(Resolve<IEntityConfigurationStore>(), rliRepoMock.Object, Resolve<ICacheManager>(), refListHelperRepoMock.Object, quickSearchPropertiesCacheHolder);

            var expression = quickSearcher.GetQuickSearchExpression<TestOrganisation>("Email", new List<string> {
                nameof(TestOrganisation.ContactMethods)
            });

            var query = orgRepoMock.Object.GetAll();

            query = query.Where(expression);

            var data = query.ToList();

            // query expected list
            var expected = testOrganisations.Where(o => (o.ContactMethods & (Int64)TestContactMethod.Email) > 0).ToList();
            // and compare with results of quick search
            data.Should().BeEquivalentTo(expected);
        }

        #region private methods

        private async Task<List<T>> TryFetchDataAsync<T, TId>(Func<IQueryable<T>, IQueryable<T>>? prepareQueryable = null, Action<List<T>>? assertions = null) where T : class, IEntity<TId>
        {
            var repository = LocalIocManager.Resolve<IRepository<T, TId>>();
            var asyncExecuter = LocalIocManager.Resolve<IAsyncQueryableExecuter>();

            return await WithUnitOfWorkAsync(async () => {
                var query = repository.GetAll();

                if (prepareQueryable != null)
                    query = prepareQueryable.Invoke(query);

                var data = await asyncExecuter.ToListAsync(query);

                assertions?.Invoke(data);
                return data;
            });
        }

        #endregion
    }

    public class TestPerson: Entity<Guid>
    {
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual RefListPersonTitle? Title { get; set; }
        public virtual TestOrganisation Organisation { get; set; }
        
        [ReferenceList("Shesha.Core", "PreferredContactMethod")]
        public virtual Int64? PreferredContactMethod { get; set; }
    }

    public class TestOrganisation : Entity<Guid>
    {
        //[EntityDisplayName]
        public virtual string Name { get; set; }
        public virtual string Address { get; set; }
        
        [MultiValueReferenceList("Shesha.Core", "PreferredContactMethod"/*, Module = "Shesha"*/)]
        public virtual Int64? ContactMethods { get; set; }
    }

    [Flags]
    public enum TestContactMethod: Int64
    { 
        Email = 1,
        Sms = 2,
        Fax = 4,
    }
}
