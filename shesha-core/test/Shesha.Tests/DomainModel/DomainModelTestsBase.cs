using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Reflection;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Tests.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    public abstract class DomainModelTestsBase : SheshaNhTestBase
    {
        protected DomainModelTestsBase(IDatabaseFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task Repository_ShouldFetchAllEntityTypes_Async()
        {
            var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();

            var types = typeFinder.FindAll().Where(t => t.IsEntityType()
    && t != typeof(AggregateRoot)
    && t != typeof(UserPermissionSetting)
    && t != typeof(RolePermissionSetting)
    && t.Assembly != this.GetType().Assembly
    ).ToList();

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
            public Task TryFetchAsync() 
            {
                return _repo.GetAll().OrderBy(e => e.Id).FirstOrDefaultAsync();
            }
        }
    }
}