using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.IdentityFramework;
using Abp.Linq;
using Abp.Runtime.Session;
using Abp.UI;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Newtonsoft.Json.Linq;
using Shesha.Authorization.Users;
using Shesha.DelayedUpdate;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Binder;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.Mapper;
using Shesha.Extensions;
using Shesha.MultiTenancy;
using Shesha.Services;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FluentValidationResult = FluentValidation.Results.ValidationResult;

namespace Shesha
{
    /// <summary>
    /// Derive your application services from this class.
    /// </summary>
    public abstract class SheshaAppServiceBase : ApplicationService
    {
        public SheshaAppServiceBase()
        {
            AsyncQueryableExecuter = NullAsyncQueryableExecuter.Instance;
        }

        public IAsyncQueryableExecuter AsyncQueryableExecuter { get; set; }
        public IObjectValidatorManager ValidatorManager { get; set; }

        /// <summary>
        /// Reference to the IoC manager.
        /// </summary>
        public IIocManager IocManager { get; set; }

        /// <summary>
        /// Dynamic repository
        /// </summary>
        public IDynamicRepository DynamicRepo { protected get; set; }

        /// <summary>
        /// Tenant manager
        /// </summary>
        public TenantManager TenantManager { get; set; }

        /// <summary>
        /// User Manager
        /// </summary>
        public UserManager UserManager { get; set; }

        /// <summary>
        /// Dynamic DTO builder
        /// </summary>
        public IDynamicDtoTypeBuilder DtoBuilder { get; set; }

        /// <summary>
        /// Dynamic property manager
        /// </summary>
        public IDynamicPropertyManager DynamicPropertyManager { get; set; }

        /// <summary>
        /// Dynamic DTO mapping helper
        /// </summary>
        public IDynamicDtoMappingHelper DynamicDtoMappingHelper { get; set; }

        public IEntityModelBinder EntityModelBinder { get; set; }

        private IUrlHelper _url;

        /// <summary>
        /// Url helper
        /// </summary>
        public IUrlHelper Url
        {
            get
            {
                if (_url == null)
                {
                    var actionContextAccessor = IocManager.Resolve<IActionContextAccessor>();
                    var urlHelperFactory = IocManager.Resolve<IUrlHelperFactory>();
                    _url = urlHelperFactory.GetUrlHelper(actionContextAccessor.ActionContext);
                }

                return _url;
            }
        }

        /// <summary>
        /// Cet current logged in person
        /// </summary>
        /// <returns></returns>
        protected virtual async Task<Domain.Person> GetCurrentPersonAsync()
        {
            var personRepository = IocManager.Resolve<IRepository<Domain.Person, Guid>>();
            var person = await personRepository.GetAll().FirstOrDefaultAsync(p => p.User.Id == AbpSession.GetUserId());
            return person;
        }

        /// <summary>
        /// Get current logged in user
        /// </summary>
        /// <returns></returns>
        protected virtual async Task<User> GetCurrentUserAsync()
        {
            var user = await UserManager.FindByIdAsync(AbpSession.GetUserId().ToString());
            if (user == null)
            {
                throw new Exception("There is no current user!");
            }

            return user;
        }

        /// <summary>
        /// Get current tenant
        /// </summary>
        /// <returns></returns>
        protected virtual Task<Tenant> GetCurrentTenantAsync()
        {
            return TenantManager.GetByIdAsync(AbpSession.GetTenantId());
        }

        /// <summary>
        /// Check errors
        /// </summary>
        /// <param name="identityResult"></param>
        protected virtual void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }

        /// <summary>
        /// Saves or update entity with the specified id
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="id">Id of the existing entity or null for a new one</param>
        /// <param name="action">Update action</param>
        protected async Task<T> SaveOrUpdateEntityAsync<T>(Guid? id, Func<T, Task> action)
            where T : class, IEntity<Guid>
        {
            return await SaveOrUpdateEntityAsync<T, Guid>(id, action);
        }

        /// <summary>
        /// Saves or update entity with the specified id
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="id">Id of the existing entity or null for a new one</param>
        /// <param name="action">Update action</param>
        protected async Task<T> SaveOrUpdateEntityAsync<T>(Guid? id, Action<T> action)
            where T : class, IEntity<Guid>
        {
            return await SaveOrUpdateEntityAsync<T, Guid>(id, a => { 
                action.Invoke(a);
                return Task.CompletedTask;
            });
        }

        /// <summary>
        /// Saves or update entity with the specified id
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <typeparam name="TId">Id type</typeparam>
        /// <param name="id">Id of the existing entity or null for a new one</param>
        /// <param name="action">Update action</param>
        /// <returns></returns>
        protected async Task<T> SaveOrUpdateEntityAsync<T, TId>(TId? id, Func<T, Task> action) where T : class, IEntity<TId> where TId : struct
        {
            var item = id.HasValue
                ? await GetEntityAsync<T, TId>(id.Value)
                : (T)Activator.CreateInstance(typeof(T));

            await action.Invoke(item);

            await DynamicRepo.SaveOrUpdateAsync(item);

            return item;
        }

        /// <summary>
        /// Returns entity of the specified type with the specified <paramref name="id"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="id">Id of the entity</param>
        /// <param name="throwException">Throw exception if entity not found</param>
        /// <returns></returns>
        protected async Task<T> GetEntityAsync<T>(Guid id, bool throwException = true) where T : class, IEntity<Guid>
        {
            return await GetEntityAsync<T, Guid>(id, throwException);
        }

        /// <summary>
        /// Returns entity of the specified type with the specified <paramref name="id"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <typeparam name="TId">Id type</typeparam>
        /// <param name="id">Id of the entity</param>
        /// <param name="throwException">Throw exception if entity not found</param>
        /// <returns></returns>
        protected async Task<T> GetEntityAsync<T, TId>(TId id, bool throwException = true) where T : class, IEntity<TId>
        {
            var item = await DynamicRepo.GetAsync(typeof(T), id.ToString());

            if (item != null)
                return (T)item;

            if (throwException)
                throw new UserFriendlyException($"{typeof(T).Name} with the specified id `{id}` not found");

            return null;
        }

        /// <summary>
        /// Runs validation
        /// </summary>
        /// <param name="entity"></param>
        /// <param name="validationResults"></param>
        /// <returns></returns>
        protected async Task<bool> ValidateEntityAsync<TEntity>(TEntity entity, List<ValidationResult> validationResults)
        {
            await FluentValidationsOnEntityAsync(entity, validationResults);
            var result = !validationResults.Any();
            if (ValidatorManager != null)
                result = result && await ValidatorManager.ValidateObject(entity, validationResults);
            return result && Validator.TryValidateObject(entity, new ValidationContext(entity), validationResults);
        }

		/// <summary>
		/// Runs validation defined on entity through fluentValidation
		/// </summary>
		/// <param name="entity"></param>
		/// <param name="validationResults"></param>
		/// <returns></returns>
		protected async Task FluentValidationsOnEntityAsync<TEntity>(TEntity entity, List<ValidationResult> validationResults)
		{
			if (StaticContext.IocManager.IsRegistered(typeof(IValidator<TEntity>)))
			{
				var validators = StaticContext.IocManager.ResolveAll<IValidator<TEntity>>();

				foreach (var validator in validators)
				{
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

		#region Dynamic DTOs

		/// <summary>
		/// Map entity to a <see cref="DynamicDto{TEntity, TPrimaryKey}"/>
		/// </summary>
		/// <typeparam name="TEntity">Type of entity</typeparam>
		/// <typeparam name="TPrimaryKey">Type of entity primary key</typeparam>
		/// <param name="entity">entity to map</param>
		/// <param name="settings">mapping settings</param>
		/// <returns></returns>
		protected async Task<DynamicDto<TEntity, TPrimaryKey>> MapToDynamicDtoAsync<TEntity, TPrimaryKey>(TEntity entity, IDynamicMappingSettings settings = null) where TEntity : class, IEntity<TPrimaryKey>
        {
            return await MapToCustomDynamicDtoAsync<DynamicDto<TEntity, TPrimaryKey>, TEntity, TPrimaryKey>(entity, settings);
        }

        /// <summary>
        /// Map entity to a custom <see cref="DynamicDto{TEntity, TPrimaryKey}"/>
        /// </summary>
        /// <typeparam name="TDynamicDto">Type of dynamic DTO</typeparam>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of entity primary key</typeparam>
        /// <param name="entity">entity to map</param>
        /// <param name="settings">mapping settings</param>
        /// <returns></returns>
        protected async Task<TDynamicDto> MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(TEntity entity, IDynamicMappingSettings settings = null)
            where TEntity : class, IEntity<TPrimaryKey>
            where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        {
            return await EntityToDtoModelExtesions.MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(entity, settings);
        }

        /// <summary>
        /// Map static properties (defined in the entity class) of dynamic DTO to a specified entity
        /// </summary>
        /// <typeparam name="TDynamicDto">Type of Dynamic DTO</typeparam>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of primary key</typeparam>
        /// <param name="dto">Source DTO</param>
        /// <param name="entity">Destination entity</param>
        /// <returns></returns>
        protected async Task MapStaticPropertiesToEntityDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(TDynamicDto dto, TEntity entity)
            where TEntity : class, IEntity<TPrimaryKey>
            where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        {
            var mapper = await DynamicDtoMappingHelper.GetDtoToEntityMapperAsync(entity.GetType(), dto.GetType());

            mapper.Map(dto, entity);
        }

        /// <summary>
        /// Map dynamic properties (defined using entity configurator) of dynamic DTO to a specified entity
        /// </summary>
        /// <typeparam name="TDynamicDto">Type of Dynamic DTO</typeparam>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of primary key</typeparam>
        /// <param name="dto">Source DTO</param>
        /// <param name="entity">Destination entity</param>
        /// <returns></returns>
        protected async Task MapDynamicPropertiesToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(TDynamicDto dto, TEntity entity)
            where TEntity : class, IEntity<TPrimaryKey>
            where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        {
            await DynamicPropertyManager.MapDtoToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(dto, entity);
        }

        /// <summary>
        /// Map all properties (dynamic and static) of dynamic DTO to a specified entity
        /// </summary>
        /// <typeparam name="TDynamicDto">Type of Dynamic DTO</typeparam>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of primary key</typeparam>
        /// <param name="dto">Source DTO</param>
        /// <param name="entity">Destination entity</param>
        /// <returns></returns>
        protected async Task MapDynamicDtoToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(TDynamicDto dto, TEntity entity)
            where TEntity : class, IEntity<TPrimaryKey>
            where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        {
            await MapStaticPropertiesToEntityDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(dto, entity);
            await MapDynamicPropertiesToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(dto, entity);
        }

        /// <summary>
        /// Map properties of JObject to a specified entity
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of primary key</typeparam>
        /// <param name="jObject">Data</param>
        /// <param name="entity">Destination entity</param>
        /// <param name="validationResult">Validation result</param>
        /// <returns></returns>
        protected async Task<bool> MapJObjectToEntityAsync<TEntity, TPrimaryKey>(
            JObject jObject,
            TEntity entity,
            List<ValidationResult> validationResult)
            where TEntity : class, IEntity<TPrimaryKey>
        {
            var result = await MapJObjectToStaticPropertiesEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResult);
            result = result && await ValidateEntityAsync<TEntity>(entity, validationResult);

            if (!result) return false;

            return await MapJObjectToDynamicPropertiesEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResult);
        }

        /// <summary>
        /// Map static properties of JObject to a specified entity
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of primary key</typeparam>
        /// <param name="jObject">Data</param>
        /// <param name="entity">Destination entity</param>
        /// <param name="validationResult">Validation result</param>
        /// <returns></returns>
        protected async Task<bool> MapJObjectToStaticPropertiesEntityAsync<TEntity, TPrimaryKey>(
            JObject jObject,
            TEntity entity,
            List<ValidationResult> validationResult)
            where TEntity : class, IEntity<TPrimaryKey>
        {
            return await EntityModelBinder.BindPropertiesAsync(jObject, entity, new EntityModelBindingContext() { ValidationResult = validationResult });
        }

        /// <summary>
        /// Map dynamic properties of JObject to a specified entity
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <typeparam name="TPrimaryKey">Type of primary key</typeparam>
        /// <param name="jObject">Data</param>
        /// <param name="entity">Destination entity</param>
        /// <param name="validationResult">Validation result</param>
        /// <returns></returns>
        protected async Task<bool> MapJObjectToDynamicPropertiesEntityAsync<TEntity, TPrimaryKey>(
            JObject jObject,
            TEntity entity,
            List<ValidationResult> validationResult)
            where TEntity : class, IEntity<TPrimaryKey>
        {
            await DynamicPropertyManager.MapJObjectToEntityAsync<TEntity, TPrimaryKey>(jObject, entity);

            // ToDo: Add validations
            return true;
        }

        protected async Task DelayedUpdateAsync<TEntity, TPrimaryKey>(
            JObject jObject,
            TEntity entity,
            List<ValidationResult> validationResult)
            where TEntity : class, IEntity<TPrimaryKey>
        {
            var delayedUpdate = jObject.Property(nameof(IHasDelayedUpdateField._delayedUpdate))?.Value?.ToObject<List<DelayedUpdateGroup>>();
            await DelayedUpdateAsync<TEntity, TPrimaryKey>(delayedUpdate, entity, validationResult);
        }

        protected async Task DelayedUpdateAsync<TEntity, TPrimaryKey>(
            List<DelayedUpdateGroup> delayedUpdateGroups,
            TEntity entity,
            List<ValidationResult> validationResult)
            where TEntity : class, IEntity<TPrimaryKey>
        {
            if (delayedUpdateGroups?.Any() ?? false)
            {
                var managers = StaticContext.IocManager.ResolveAll<IDelayedUpdateManager>();
                foreach (var group in delayedUpdateGroups)
                {
                    foreach (var manager in managers)
                    {
                        if (manager.IsApplicable(group.Name))
                        {
                            await manager.ExecuteUpdateAsync(entity, group.Items, validationResult);
                        }
                    }
                }
            }
        }

        protected async Task<bool> DeleteCascadeAsync<TEntity>(TEntity entity)
        {
            await EntityModelBinder.DeleteCascadeAsync(entity);
            return true;
        }

        #endregion
    }
}
