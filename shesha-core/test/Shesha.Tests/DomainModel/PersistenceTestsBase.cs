using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Tests.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    public abstract class PersistenceTestsBase : SheshaNhTestBase
    {
        protected PersistenceTestsBase(IDatabaseFixture fixture) : base(fixture)
        {
        }

        private List<Type> GetEntityTypesWithoutIgnored() 
        {
            var typeFinder = StaticContext.IocManager.Resolve<IShaTypeFinder>();

            var types = typeFinder.FindAll().Where(t => t.IsEntityType()
    && t != typeof(AggregateRoot)
    && t != typeof(UserPermissionSetting)
    && t != typeof(RolePermissionSetting)
    && t.Assembly != this.GetType().Assembly
    ).ToList();
            return types;
        }

        public static bool IsExplicitlyVirtual(PropertyInfo property)
        {
            var accessor = property.GetGetMethod(true) ?? property.GetSetMethod(true);

            // True only if:
            // 1. IsVirtual is true
            // 2. Not an interface implementation
            // 3. Not from a proxy class
            // 4. Not an override
            return accessor != null &&
                   accessor.IsVirtual &&
                   !accessor.IsFinal /*&&
                   accessor.GetBaseDefinition().DeclaringType == property.DeclaringType*/;
        }

        [Fact]
        public void EntityProperties_ShouldBeVirtual() 
        {
            var types = GetEntityTypesWithoutIgnored();
            var sb = new StringBuilder();
            foreach (var type in types) 
            {
                if (!string.IsNullOrWhiteSpace(type.FullName) && type.FullName.StartsWith("Abp."))
                    continue;

                var properties = type.GetProperties(BindingFlags.DeclaredOnly | BindingFlags.GetProperty | BindingFlags.Public | BindingFlags.Instance);
                var nonVirtual = properties.Where(p => !IsExplicitlyVirtual(p)).ToList();
                if (nonVirtual.Any()) 
                {
                    sb.AppendLine(type.FullName);
                    foreach (var property in nonVirtual)
                        sb.AppendLine($"    {property.Name}");
                }
            }

            sb.Length.ShouldBe(0, "Found non virtual properties in entity classes: \r\n\r\n" + sb.ToString());
        }

        [Fact]
        public async Task Repository_ShouldFetchAllEntityTypes_Async()
        {
            var types = GetEntityTypesWithoutIgnored();

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