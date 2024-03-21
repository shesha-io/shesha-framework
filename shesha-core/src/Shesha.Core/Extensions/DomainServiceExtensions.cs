using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Runtime.Session;
using Abp.UI;
using Shesha.Services;
using System;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    public static class DomainServiceExtensions
    {

        public static async Task<Person> GetCurrentPerson(this DomainService service)
        {
            var personRepository = IocManager.Instance.Resolve<IRepository<Person, Guid>>();
            var _session = StaticContext.IocManager.Resolve<IAbpSession>();
            var person = await personRepository.FirstOrDefaultAsync(p => p.User.Id == _session.GetUserId());
            return person;
        }

        /// <summary>
        /// Returns entity of the specified type with the specified <paramref name="id"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="service"></param>
        /// <param name="id">Id of the entity</param>
        /// <param name="throwException">Throw exception if entity not found</param>
        /// <returns></returns>
        public static async Task<T> GetEntityAsync<T>(this DomainService service, Guid id, bool throwException = true) where T : class, IEntity<Guid>
        {
            return await GetEntityAsync<T, Guid>(service, id, throwException);
        }

        /// <summary>
        /// Returns entity of the specified type with the specified <paramref name="id"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <typeparam name="TId">Id type</typeparam>
        /// <param name="service"></param>
        /// <param name="id">Id of the entity</param>
        /// <param name="throwException">Throw exception if entity not found</param>
        /// <returns></returns>
        public static async Task<T> GetEntityAsync<T, TId>(this DomainService service, TId id, bool throwException = true) where T : class, IEntity<TId>
        {
            var dynamicRepo = StaticContext.IocManager.Resolve<IDynamicRepository>();

            var item = await dynamicRepo.GetAsync(typeof(T), id.ToString());

            if (item != null)
                return (T)item;

            if (throwException)
                throw new UserFriendlyException($"{typeof(T).Name} with the specified id `{id}` not found");

            return null;
        }

        /// <summary>
        /// Saves or updates the entity of the specified type.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="TId"></typeparam>
        /// <param name="service"></param>
        /// <param name="id"></param>
        /// <param name="action"></param>
        /// <returns></returns>
        public static async Task<T> SaveOrUpdateEntityAsync<T, TId>(this DomainService service, TId? id, Func<T, Task> action) where T : class, IEntity<TId> where TId: struct
        {
			var isNew = id == null;
			var item = !isNew
				? await GetEntityAsync<T, TId>(service, id.Value)
				: (T)Activator.CreateInstance(typeof(T));

			await action.Invoke(item);

			var dynamicRepo = StaticContext.IocManager.Resolve<IDynamicRepository>();
			await dynamicRepo.SaveOrUpdateAsync(item);

			return item;
		}

	}
}
