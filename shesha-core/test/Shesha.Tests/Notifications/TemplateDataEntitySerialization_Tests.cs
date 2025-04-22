using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Json;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Reflection;
using Shesha.Tests.Fixtures;
using Shesha.Utilities;
using Shouldly;
using Stubble.Core.Builders;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Notifications
{
    [Collection(SqlServerCollection.Name)]
    public class TemplateDataEntitySerialization_Tests : SheshaNhTestBase
    {
        private readonly IRepository<Person, Guid> _personRepository;

        public TemplateDataEntitySerialization_Tests(SqlServerFixture fixture) : base(fixture)
        {
            _personRepository = Resolve<IRepository<Person, Guid>>();
        }

        [Fact]
        public Task PersonSerialization_TestAsync() 
        {
            return WithUnitOfWorkAsync(async() => {
                var author = await GetAuthorAsync();
                var liveData = new SourceData {
                    Message = "Hi!",
                    Author = author
                };
                var dataBefore = new CustomTemplateData
                {
                    Message = liveData.Message,
                    Author = liveData.Author,
                };

                var json = dataBefore.ToJsonString();
                
                var dataAfter = json.FromJsonString<CustomTemplateData>().NotNull();

                var restoredPerson = (Person)dataAfter.Author;
                restoredPerson.FirstName.ShouldBe(author.FirstName);

                var restoredPersonForceCast = dataAfter.Author.ForceCastAs<Person>();
                restoredPersonForceCast.FirstName.ShouldBe(author.FirstName);

                var template = @"{{Author.FirstName}} {{Author.LastName}} says: '{{Message}}'";
                
                var messageLive = await GenerateContentAsync(template, liveData);
                var messageBefore = await GenerateContentAsync(template, dataBefore);
                var messageAfter = await GenerateContentAsync(template, dataAfter);

                messageBefore.ShouldBe(messageLive);
                messageAfter.ShouldBe(messageBefore);
            });
        }

        protected async Task<string?> GenerateContentAsync<TData>(string? template, TData data)
        {
            var stubbleRenderer = new StubbleBuilder().Configure(settings =>
            {
                settings.SetIgnoreCaseOnKeyLookup(true);

                settings.AddValueGetter(typeof(GenericEntityReference), (object value, string key, bool ignoreCase) => {
                    if (value is GenericEntityReference entityRef)
                    {
                        var entity = (Entity<Guid>)entityRef;
                        
                        return entity != null
                            ? ReflectionHelper.GetPropertyValue(entity, key, null)
                            : null;
                    } else
                        return null;                        
                });
            }).Build();

            return !string.IsNullOrWhiteSpace(template)
                ? await stubbleRenderer.RenderAsync(template, data)
                : template;
        }

        private async Task<Person> GetAuthorAsync() 
        {
            var id = "6F395F2B-5BA4-4E2D-B1F2-DD2EB426E3FA".ToGuid();
            var person = await _personRepository.FirstOrDefaultAsync(id);
            if (person == null) 
            {
                person = new Person { Id = id, FirstName = "John", LastName = "Doe", EmailAddress1 = "john.doe@mail.com" };
                await _personRepository.InsertAsync(person);
            }
            return person;
        }

        public class SourceData
        { 
            public string Message { get; set; }
            public Person Author { get; set; }
        }

        public class CustomTemplateData
        {
            public string Message { get; set; }
            public GenericEntityReference Author { get; set; }
        }
    }
}
