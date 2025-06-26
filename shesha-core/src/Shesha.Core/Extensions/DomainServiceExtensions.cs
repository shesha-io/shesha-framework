using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Runtime.Session;
using Abp.UI;
using FluentValidation;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using FluentValidationResult = FluentValidation.Results.ValidationResult;

namespace Shesha.Domain
{
    public static class DomainServiceExtensions
    {

        public static async Task<Person> GetCurrentPersonAsync(this DomainService service)
        {
            var personRepository = StaticContext.IocManager.Resolve<IRepository<Person, Guid>>();
            var _session = StaticContext.IocManager.Resolve<IAbpSession>();
            var person = await personRepository.FirstOrDefaultAsync(p => p.User != null && p.User.Id == _session.GetUserId());
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
        public static async Task<T?> GetEntityAsync<T>(this DomainService service, Guid id, bool throwException = true) where T : class, IEntity<Guid>
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
        public static async Task<T?> GetEntityAsync<T, TId>(this DomainService service, TId id, bool throwException = true) where T : class, IEntity<TId>
        {
            var stringId = id?.ToString();
            ArgumentException.ThrowIfNullOrWhiteSpace(stringId, nameof(id));

            var dynamicRepo = StaticContext.IocManager.Resolve<IDynamicRepository>();

            var item = await dynamicRepo.GetAsync(typeof(T), stringId);

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
            var item = id != null
                ? (await GetEntityAsync<T, TId>(service, id.Value)).NotNull()
                : ActivatorHelper.CreateNotNullInstance<T>();

			await action.Invoke(item);

			var dynamicRepo = StaticContext.IocManager.Resolve<IDynamicRepository>();
			await dynamicRepo.SaveOrUpdateAsync(item);

			return item;
		}

		/// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TEntity"></typeparam>
        /// <param name="service"></param>
        /// <param name="entity"></param>
        /// <param name="validationResults"></param>
        /// <returns></returns>
		public static async Task FluentValidationsOnEntityAsync<TEntity>(this DomainService service, TEntity entity, List<ValidationResult> validationResults)
		{
			if (StaticContext.IocManager.IsRegistered(typeof(IValidator<TEntity>)))
			{
				var validator = StaticContext.IocManager.Resolve<IValidator<TEntity>>();
				FluentValidationResult fluentValidationResults = await validator.ValidateAsync(entity);

				//Map FluentValidationResult to normal System.ComponentModel.DataAnnotations.ValidationResult,
				//so to throw one same Validations Exceptions on AbpValidationException
				if (!fluentValidationResults.IsValid)
					fluentValidationResults.Errors.ForEach(err =>
					{
						var memberNames = new List<string>() { err.PropertyName };
						var valResult = new ValidationResult(err.ErrorMessage, memberNames);
						validationResults.Add(valResult);
					});
			}
		}
	}
}
