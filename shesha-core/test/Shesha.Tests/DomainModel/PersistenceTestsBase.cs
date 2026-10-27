using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Testing.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    public abstract class PersistenceTestsBase : SheshaNhTestBase
    {
        protected PersistenceTestsBase(IDatabaseFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task Repository_ShouldFetchAllEntityTypes_Async()
        {
            var types = EntityTestsHelper.GetEntityTypesWithoutIgnored();

            var errors = new Dictionary<Type, Exception>();

            await WithUnitOfWorkAsync(async() => {
                foreach (var type in types)
                {
                    var idType = type.GetEntityIdType();
                    var testerType = typeof(RepositoryTester<,>).MakeGenericType(type, idType);
                    var repositoryType = typeof(IRepository<,>).MakeGenericType(type, idType);
                    var repository = Resolve(repositoryType);

                    var tester = Resolve(testerType, repository).ForceCastAs<IRepositoryTester>();

                    try
                    {
                        await tester.TryFetchAsync();
                    }
                    catch (Exception e)
                    {
                        errors.Add(type, e);
                    }
                }
            });

            // Assert
            errors.ShouldBeEmpty();
        }

        public interface IRepositoryTester 
        {
            Task TryFetchAsync();
        }

        public class RepositoryTester<T, TId>: IRepositoryTester where T: class, IEntity<TId>
        {
            private readonly IRepository<T, TId> _repo;

            public RepositoryTester(IRepository<T, TId> repo)
            {
                _repo = repo;
            }
            public async Task TryFetchAsync() 
            {
                await (await _repo.GetAllAsync()).OrderBy(e => e.Id).FirstOrDefaultAsync();
            }
        }
    }
}