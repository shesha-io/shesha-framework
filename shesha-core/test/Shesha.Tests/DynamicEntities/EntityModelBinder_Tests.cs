using Abp.Auditing;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json.Linq;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Binder;
using Shesha.Reflection;
using Shesha.Tests.Fixtures;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DynamicEntities
{
    [Collection(SqlServerCollection.Name)]
    public class EntityModelBinder_Tests : SheshaNhTestBase
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IEntityModelBinder _entityModelBinder;
        private readonly IRepository<Person, Guid> _personRepo;

        public EntityModelBinder_Tests(SqlServerFixture fixture) : base(fixture)
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _entityModelBinder = Resolve<IEntityModelBinder>();
            _personRepo = Resolve<IRepository<Person, Guid>>();
        }

        [Fact]
        public async Task Datetime_TestAsync()
        {
            LoginAsHostAdmin();

            using (var uow = NewNhUnitOfWork())
            {
                Person? testPerson = null;

                try
                {
                    var json1 = @"{ 'firstName': 'TestPerson', 'gender': 'Male', 'dateOfBirth': '2011-12-13T12:13:14Z' }";
                    var jObject1 = JObject.Parse(json1);
                    var testErrors1 = new List<ValidationResult>();
                    testPerson = new Person();
                    var testResult1 = await _entityModelBinder.BindPropertiesAsync(jObject1, testPerson, new EntityModelBindingContext());
                    Assert.True(testResult1);
                    Assert.True(testPerson.DateOfBirth == new DateTime(2011, 12, 13)); // Check only date because Person.DateOfBirth has DataType(DataType.Date) attribute
                }
                finally
                {
                }
            }
        }

        [Fact]
        public async Task RefList_TestAsync()
        {
            LoginAsHostAdmin();

            using (var uow = NewNhUnitOfWork())
            {
                TestOrganisationAllowContactUpdate? newTestOrg1 = null;

                try
                {
                    // Child creation is allowed and success
                    var json1 =
                        @"{ 'name': 'TestOrganisation', 'testEnum': [1, 4], 'primaryContact': { 'firstName': 'TestPerson', 'gender': 'Male' } }";
                    var jObject1 = JObject.Parse(json1);
                    var testErrors1 = new List<ValidationResult>();
                    newTestOrg1 = new TestOrganisationAllowContactUpdate();
                    var testResult1 = await _entityModelBinder.BindPropertiesAsync(jObject1, newTestOrg1, new EntityModelBindingContext());
                    Assert.True(testResult1);
                    //Assert.True(newTestOrg1.TestEnum == (TestEnum.One | TestEnum.Four));
                    Assert.True(newTestOrg1.PrimaryContact?.Gender == Domain.Enums.RefListGender.Male);
                }
                finally
                {
                    /*if (newTestOrg1 != null) testOrgRepo.HardDelete(newTestOrg1);
                    if (newTestPerson1 != null) _personRepo.HardDelete(newTestPerson1);
                    await nhuow.SaveChangesAsync();*/
                }
            }
        }

        [Fact]
        public async Task FormField_TestAsync()
        {
            LoginAsHostAdmin();

            var repoOrg = Resolve<IRepository<Organisation, Guid>>();
            var testOrgRepo = Resolve<IRepository<TestOrganisationAllowContactUpdate, Guid>>();

            using (var uow = NewNhUnitOfWork())
            {
                Person? newTestPerson1 = null;
                TestOrganisationAllowContactUpdate? newTestOrg1 = null;

                try
                {
                    // Child creation is allowed and success
                    var json1 =
                        @"{ '_formFields': ['name', 'primaryContact.firstName'], 'name': 'TestOrganisation', 'description': 'TestDescription', 'primaryContact': { 'firstName': 'TestPerson', 'customShortName': 'TestCustomShortName' } }";
                    var jObject1 = JObject.Parse(json1);
                    var testErrors1 = new List<ValidationResult>();
                    newTestOrg1 = new TestOrganisationAllowContactUpdate();
                    var testResult1 = await _entityModelBinder.BindPropertiesAsync(jObject1, newTestOrg1, new EntityModelBindingContext());
                    Assert.True(testResult1);
                    await testOrgRepo.InsertAsync(newTestOrg1);
                    await uow.SaveChangesAsync();
                    newTestOrg1 = testOrgRepo.GetAll().FirstOrDefault(x => x.Name == "TestOrganisation");
                    Assert.True(newTestOrg1 != null);

                    newTestPerson1 = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson");
                    Assert.True(newTestPerson1 != null);
                    Assert.True(string.IsNullOrEmpty(newTestOrg1.Description));
                    Assert.True(string.IsNullOrEmpty(newTestPerson1.CustomShortName));
                }
                finally
                {
                    if (newTestOrg1 != null) testOrgRepo.HardDelete(newTestOrg1);
                    if (newTestPerson1 != null) _personRepo.HardDelete(newTestPerson1);
                    await uow.SaveChangesAsync();
                }
            }
        }

        [Fact]
        public async Task CascadeRuleEntityFinder_TestAsync()
        {
            LoginAsHostAdmin();
            using (var uow = NewNhUnitOfWork())
            {
                var ent = new Person() { FirstName = "TestPerson", LastName = "TestPerson", DateOfBirth = new DateTime(1978, 09, 24, 13, 24, 17) };

                await _personRepo.InsertAsync(ent);
                await uow.SaveChangesAsync();

                var checkEnt = new Person() { FirstName = "TestPerson", LastName = "TestPerson", DateOfBirth = new DateTime(1978, 09, 24) };

                var f = new Finder();
                var newEnt = f.FindEntity(new CascadeRuleEntityFinderInfo(checkEnt) { _Repository = _personRepo });
                Assert.NotNull(newEnt);

                checkEnt.FirstName = "TestPersonNew";
                newEnt = f.FindEntity(new CascadeRuleEntityFinderInfo(checkEnt) { _Repository = _personRepo });
                Assert.Null(newEnt);

                _personRepo.HardDelete(ent);
                await uow.SaveChangesAsync();
            }
        }

        [Fact]
        public async Task CascadeCreateUpdateAndRules_TestAsync()
        {
            LoginAsHostAdmin();

            var repoOrg = Resolve<IRepository<Organisation, Guid>>();
            var testOrgRepo = Resolve<IRepository<TestOrganisationAllowContactUpdate, Guid>>();

            using (var uow = NewNhUnitOfWork())
            {
                Person? newTestPerson1 = null;
                Person? newTestPerson2 = null;
                TestOrganisationAllowContactUpdate? newTestOrg1 = null;
                TestOrganisationAllowContactUpdate? newTestOrg2 = null;
                TestOrganisationAllowContactUpdate? newTestOrg3 = null;
                TestOrganisationAllowContactUpdate? newTestOrg4 = null;
                TestOrganisationAllowContactUpdate? newTestOrg5 = null;
                TestOrganisationAllowContactUpdate? newTestOrg6 = null;
                TestOrganisationAllowContactUpdate? newTestOrg7 = null;
                TestOrganisationAllowContactUpdate? newTestOrg8 = null;

                try
                {
                    // Child creation is not allowed
                    var errors = new List<ValidationResult>();
                    var newOrg = new TestOrganisationDisallowContactUpdate();
                    var json1 = @"{ 'name': 'TestOrganisation', 'primaryContact': { 'firstName': 'TestPerson' } }";
                    var jObject1 = JObject.Parse(json1);
                    var result = await _entityModelBinder.BindPropertiesAsync(jObject1, newOrg, new EntityModelBindingContext());
                    Assert.False(result);

                    // Child creation is allowed and success
                    var testErrors1 = new List<ValidationResult>();
                    newTestOrg1 = new TestOrganisationAllowContactUpdate();
                    var testResult1 = await _entityModelBinder.BindPropertiesAsync(jObject1, newTestOrg1, new EntityModelBindingContext());
                    Assert.True(testResult1);
                    await testOrgRepo.InsertAsync(newTestOrg1);
                    await uow.SaveChangesAsync();
                    newTestOrg1 = testOrgRepo.GetAll().FirstOrDefault(x => x.Name == "TestOrganisation");
                    Assert.NotNull(newTestOrg1);
                    newTestPerson1 = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson");
                    Assert.True(newTestPerson1 != null);
                    // Check for prepared value
                    Assert.StartsWith("This is prepared value", newTestPerson1.MiddleName);

                    // Child creation is allowed but fail due to empty FirstName
                    var testErrors2 = new List<ValidationResult>();
                    newTestOrg2 = new TestOrganisationAllowContactUpdate();
                    var json2 = @"{ 'name': 'TestOrganisation', 'primaryContact': { 'lastName': 'TestPerson' } }";
                    var jObject2 = JObject.Parse(json2);
                    var testResult2 = await _entityModelBinder.BindPropertiesAsync(jObject2, newTestOrg2, new EntityModelBindingContext());
                    Assert.False(testResult2);

                    // Child creation is allowed and choosing by FirstName
                    var testErrors3 = new List<ValidationResult>();
                    newTestOrg3 = new TestOrganisationAllowContactUpdate();
                    var json3 = @"{ 'name': 'TestOrganisation3', 'primaryContact': { 'firstName': 'TestPerson' } }";
                    var jObject3 = JObject.Parse(json3);
                    var testResult3 = await _entityModelBinder.BindPropertiesAsync(jObject3, newTestOrg3, new EntityModelBindingContext());
                    Assert.True(testResult3);
                    await testOrgRepo.InsertAsync(newTestOrg3);
                    await uow.SaveChangesAsync();
                    Assert.True(newTestOrg3.PrimaryContact.Id == newTestPerson1?.Id);

                    // Child creation is allowed and choosing by FirstName with updating child LastName
                    var lastName = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson")?.LastName;
                    var testErrors4 = new List<ValidationResult>();
                    newTestOrg4 = new TestOrganisationAllowContactUpdate();
                    var json4 = @"{ 'name': 'TestOrganisation4', 'primaryContact': { 'firstName': 'TestPerson', 'lastName': 'TestLastName' } }";
                    var jObject4 = JObject.Parse(json4);
                    var testResult4 = await _entityModelBinder.BindPropertiesAsync(jObject4, newTestOrg4, new EntityModelBindingContext());
                    Assert.True(testResult4);
                    await testOrgRepo.InsertAsync(newTestOrg4);
                    await uow.SaveChangesAsync();
                    newTestOrg4 = testOrgRepo.GetAll().FirstOrDefault(x => x.Name == "TestOrganisation4");
                    Assert.NotNull(newTestOrg4);
                    Assert.True(newTestOrg4.PrimaryContact.Id == newTestPerson1?.Id);
                    Assert.True(newTestOrg4.PrimaryContact.LastName == "TestLastName");
                    Assert.True(newTestOrg4.PrimaryContact.LastName != lastName);
                    newTestPerson1 = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson");
                    Assert.True(newTestPerson1 != null);

                    // Create test person 2
                    newTestPerson2 = new Person() { FirstName = "TestPerson2" };
                    await _personRepo.InsertAsync(newTestPerson2);
                    await uow.SaveChangesAsync();
                    newTestPerson2 = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson2");
                    Assert.NotNull(newTestPerson2);

                    // Change child by Id and check if TestPerson1 is not deleted by DeleteUnreferenced because is referenced to TestOrganisation3 and TestOrganisation4
                    var testErrors5 = new List<ValidationResult>();
                    var json5 = @$"{{ 'id': '{newTestOrg1.Id}', 'name': 'TestOrganisation1', 'primaryContact': {{ 'id': '{newTestPerson2.Id}' }} }}";
                    var jObject5 = JObject.Parse(json5);
                    newTestOrg5 = await testOrgRepo.GetAsync(newTestOrg1.Id);
                    var testResult5 = await _entityModelBinder.BindPropertiesAsync(jObject5, newTestOrg5, new EntityModelBindingContext());
                    Assert.True(testResult5);
                    await uow.SaveChangesAsync();
                    newTestOrg5 = await testOrgRepo.GetAsync(newTestOrg1.Id);
                    newTestPerson1 = await _personRepo.GetAsync(newTestPerson1.Id);
                    Assert.True(newTestOrg5.Name == "TestOrganisation1");
                    Assert.True(newTestOrg5.PrimaryContact.Id == newTestPerson2?.Id);
                    Assert.True(newTestOrg5.PrimaryContact?.FirstName == "TestPerson2");
                    Assert.True(newTestPerson1 != null);

                    // Edit child with Id
                    var testErrors6 = new List<ValidationResult>();
                    var json6 = @$"{{ 'id': '{newTestOrg1.Id}', 'primaryContact': {{ 'id': '{newTestPerson2.Id}', 'lastName': 'TestLastName2' }} }}";
                    var jObject6 = JObject.Parse(json6);
                    newTestOrg6 = await testOrgRepo.GetAsync(newTestOrg1.Id);
                    var testResult6 = await _entityModelBinder.BindPropertiesAsync(jObject6, newTestOrg6, new EntityModelBindingContext());
                    Assert.True(testResult6);
                    await uow.SaveChangesAsync();
                    newTestOrg6 = await testOrgRepo.GetAsync(newTestOrg1.Id);
                    newTestPerson2 = await _personRepo.GetAsync(newTestPerson2.Id);
                    Assert.True(newTestOrg6.Name == "TestOrganisation1");
                    Assert.True(newTestOrg6.PrimaryContact?.Id == newTestPerson2.Id && newTestPerson2.LastName == "TestLastName2");

                    // Change child by Id short notation
                    var testErrors7 = new List<ValidationResult>();
                    var json7 = @$"{{ 'id': '{newTestOrg3.Id}', 'primaryContactId': '{newTestPerson2.Id}' }}";
                    var jObject7 = JObject.Parse(json7);
                    newTestOrg7 = await testOrgRepo.GetAsync(newTestOrg3.Id);
                    var testResult7 = await _entityModelBinder.BindPropertiesAsync(jObject7, newTestOrg7, new EntityModelBindingContext());
                    Assert.True(testResult7);
                    await uow.SaveChangesAsync();
                    newTestOrg7 = await testOrgRepo.GetAsync(newTestOrg3.Id);
                    Assert.True(newTestOrg7.Name == "TestOrganisation3");
                    Assert.True(newTestOrg7.PrimaryContact?.Id == newTestPerson2.Id);

                    // Change child by Id and edit
                    var testErrors8 = new List<ValidationResult>();
                    var json8 = @$"{{ 'id': '{newTestOrg3.Id}', 'primaryContact': {{ 'id': '{newTestPerson2.Id}', 'firstName': 'TestPerson22', 'lastName': 'TestLastName22' }} }}";
                    var jObject8 = JObject.Parse(json8);
                    newTestOrg8 = await testOrgRepo.GetAsync(newTestOrg4.Id);
                    Assert.True(newTestOrg8.PrimaryContact?.Id == newTestPerson1.Id);
                    var testResult8 = await _entityModelBinder.BindPropertiesAsync(jObject8, newTestOrg8, new EntityModelBindingContext());
                    Assert.True(testResult8);
                    await uow.SaveChangesAsync();
                    newTestOrg8 = await testOrgRepo.GetAsync(newTestOrg4.Id);
                    newTestPerson1 = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson1");
                    newTestPerson2 = _personRepo.GetAll().FirstOrDefault(x => x.FirstName == "TestPerson22");
                    Assert.NotNull(newTestPerson2);
                    Assert.True(newTestPerson1 == null);
                    Assert.True(newTestOrg8.Name == "TestOrganisation4");
                    Assert.True(newTestOrg8.PrimaryContact?.Id == newTestPerson2.Id && newTestPerson2.FirstName == "TestPerson22" && newTestPerson2.LastName == "TestLastName22");
                }
                finally
                {
                    if (newTestOrg1 != null) testOrgRepo.HardDelete(newTestOrg1);
                    if (newTestOrg2 != null) testOrgRepo.HardDelete(newTestOrg2);
                    if (newTestOrg3 != null) testOrgRepo.HardDelete(newTestOrg3);
                    if (newTestOrg4 != null) testOrgRepo.HardDelete(newTestOrg4);
                    if (newTestOrg5 != null) testOrgRepo.HardDelete(newTestOrg5);
                    if (newTestOrg6 != null) testOrgRepo.HardDelete(newTestOrg6);
                    if (newTestOrg7 != null) testOrgRepo.HardDelete(newTestOrg7);
                    if (newTestOrg8 != null) testOrgRepo.HardDelete(newTestOrg8);
                    if (newTestPerson1 != null) _personRepo.HardDelete(newTestPerson1);
                    if (newTestPerson2 != null) _personRepo.HardDelete(newTestPerson2);
                    await uow.SaveChangesAsync();
                }
            }
        }
    }

    public class Finder : CascadeEntityCreatorBase<Person, Guid>
    {
        public override Person? FindEntity(CascadeRuleEntityFinderInfo<Person, Guid> info)
        {
            var p = info.NewObject;

            if (string.IsNullOrEmpty(p.FirstName)) throw new Exception($"`{nameof(Person.FirstName)}` is mandatory");
            if (string.IsNullOrEmpty(p.LastName)) throw new Exception($"`{nameof(Person.LastName)}` is mandatory");
            if (p.DateOfBirth == null) throw new Exception($"`{nameof(Person.DateOfBirth)}` is mandatory");
            var sd = p.DateOfBirth?.Date;
            var ed = sd?.AddDays(1);
            return info.Repository.NotNull().GetAll().FirstOrDefault(x => x.FirstName == p.FirstName && x.LastName == p.LastName && x.DateOfBirth > sd && x.DateOfBirth < ed);
        }
    }

    public class SimplyFinder : CascadeEntityCreatorBase<Person, Guid>
    {
        public override void VerifyEntity(CascadeRuleEntityFinderInfo<Person, Guid> info, List<ValidationResult> errors)
        {
            if (string.IsNullOrEmpty(info.NewObject.FirstName))
                errors.Add(new ValidationResult($"`{nameof(Person.FirstName)}` is mandatory"));
        }

        public override Person PrepareEntity(CascadeRuleEntityFinderInfo<Person, Guid> info)
        {
            info.NewObject.MiddleName = $"This is prepared value {DateTime.Now.ToShortDateString()} {DateTime.Now.ToShortTimeString()}";
            return info.NewObject;
        }

        public override Person? FindEntity(CascadeRuleEntityFinderInfo<Person, Guid> info)
        {
            return info.Repository.NotNull().GetAll().FirstOrDefault(x => x.FirstName == info.NewObject.FirstName);
        }
    }

    [DiscriminatorValue("Test.Organisaion")]
    public class TestOrganisationAllowContactUpdate : Organisation
    {
        [CascadeUpdateRules(true, true, true, typeof(SimplyFinder))]
        public override Person PrimaryContact { get; set; }
    }

    [DiscriminatorValue("Test.Organisaion")]
    public class TestOrganisationDisallowContactUpdate : Organisation
    {
        [CascadeUpdateRules(false, false)]
        public override Person PrimaryContact { get; set; }
    }

    [Flags, ReferenceList("Test", "TestEnum")]
    public enum TestEnum
    {
        One = 1,
        Two = 2,
        Four = 4
    }
}
