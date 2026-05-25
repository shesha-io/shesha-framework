using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.ObjectMapping;
using Shesha.Extensions;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;

namespace Shesha
{
    /// <summary>
    /// NOTE: it's a copy of <see cref="Abp.Application.Services.CrudAppServiceBase{TEntity, TEntityDto, TPrimaryKey, TGetAllInput, TCreateInput, TUpdateInput}"/>
    /// This is a common base class for CrudAppService and AsyncCrudAppService classes.
    /// Inherit either from CrudAppService or AsyncCrudAppService, not from this class.
    /// </summary>
    public abstract class AbpCrudAppService<TEntity, TEntityDto, TPrimaryKey, TGetAllInput, TCreateInput, TUpdateInput> : SheshaAppServiceBase
        where TEntity : class, IEntity<TPrimaryKey>
        where TEntityDto : IEntityDto<TPrimaryKey>
        where TUpdateInput : IEntityDto<TPrimaryKey>
    {
        protected readonly IRepository<TEntity, TPrimaryKey> Repository;

        protected virtual string GetPermissionName { get; set; }

        protected virtual string GetAllPermissionName { get; set; }

        protected virtual string CreatePermissionName { get; set; }

        protected virtual string UpdatePermissionName { get; set; }

        protected virtual string DeletePermissionName { get; set; }

        protected AbpCrudAppService(IRepository<TEntity, TPrimaryKey> repository)
        {
            Repository = repository;
        }

        /// <summary>
        /// Should apply sorting if needed.
        /// </summary>
        /// <param name="query">The query.</param>
        /// <param name="input">The input.</param>
        protected virtual IQueryable<TEntity> ApplySorting(IQueryable<TEntity> query, TGetAllInput input)
        {
            //Try to sort query if available
            var sortInput = input as ISortedResultRequest;
            if (sortInput != null)
            {
                if (!sortInput.Sorting.IsNullOrWhiteSpace())
                {
                    SortingValidator.EnsureSortingAllowed(typeof(TEntity), sortInput.Sorting);

                    var sorted = false;
                    foreach (var sortColumn in sortInput.Sorting.Split(','))
                    {
                        var trimmed = sortColumn.Trim();
                        if (string.IsNullOrEmpty(trimmed))
                            continue;

                        var column = trimmed.LeftPart(' ', ProcessDirection.LeftToRight);
                        if (string.IsNullOrEmpty(column))
                            continue;

                        var descending = trimmed.RightPart(' ', ProcessDirection.LeftToRight)?.Trim()
                            .Equals("desc", StringComparison.InvariantCultureIgnoreCase) == true;

                        if (sorted)
                        {
                            var orderedQuery = (IOrderedQueryable<TEntity>)query;
                            query = descending ? orderedQuery.ThenByDescending(column) : orderedQuery.ThenBy(column);
                        }
                        else
                        {
                            query = descending ? query.OrderByDescending(column) : query.OrderBy(column);
                            sorted = true;
                        }
                    }

                    return query;
                }
            }

            //IQueryable.Task requires sorting, so we should sort if Take will be used.
            if (input is ILimitedResultRequest)
            {
                return query.OrderByDescending(e => e.Id);
            }

            //No sorting
            return query;
        }

        /// <summary>
        /// Should apply paging if needed.
        /// </summary>
        /// <param name="query">The query.</param>
        /// <param name="input">The input.</param>
        protected virtual IQueryable<TEntity> ApplyPaging(IQueryable<TEntity> query, TGetAllInput input)
        {
            //Try to use paging if available
            var pagedInput = input as IPagedResultRequest;
            if (pagedInput != null)
            {
                return query.PageBy(pagedInput);
            }

            //Try to limit query result if available
            var limitedInput = input as ILimitedResultRequest;
            if (limitedInput != null)
            {
                return query.Take(limitedInput.MaxResultCount);
            }

            //No paging
            return query;
        }

        /// <summary>
        /// This method should create <see cref="IQueryable{TEntity}"/> based on given input.
        /// It should filter query if needed, but should not do sorting or paging.
        /// Sorting should be done in <see cref="ApplySorting"/> and paging should be done in <see cref="ApplyPaging"/>
        /// methods.
        /// </summary>
        /// <param name="input">The input.</param>
        protected virtual IQueryable<TEntity> CreateFilteredQuery(TGetAllInput input)
        {
            return Repository.GetAll();
        }

        /// <summary>
        /// Maps <typeparamref name="TEntity"/> to <typeparamref name="TEntityDto"/>.
        /// It uses <see cref="IObjectMapper"/> by default.
        /// It can be overrided for custom mapping.
        /// </summary>
        protected virtual TEntityDto MapToEntityDto(TEntity entity)
        {
            return ObjectMapper.Map<TEntityDto>(entity);
        }

        /// <summary>
        /// Maps <typeparamref name="TEntityDto"/> to <typeparamref name="TEntity"/> to create a new entity.
        /// It uses <see cref="IObjectMapper"/> by default.
        /// It can be overrided for custom mapping.
        /// </summary>
        protected virtual TEntity MapToEntity(TCreateInput createInput)
        {
            return ObjectMapper.Map<TEntity>(createInput);
        }

        /// <summary>
        /// Maps <typeparamref name="TUpdateInput"/> to <typeparamref name="TEntity"/> to update the entity.
        /// It uses <see cref="IObjectMapper"/> by default.
        /// It can be overrided for custom mapping.
        /// </summary>
        protected virtual void MapToEntity(TUpdateInput updateInput, TEntity entity)
        {
            ObjectMapper.Map(updateInput, entity);
        }

        protected virtual void CheckPermission(string permissionName)
        {
            if (!string.IsNullOrEmpty(permissionName))
            {
                PermissionChecker.Authorize(permissionName);
            }
        }

        protected virtual void CheckGetPermission()
        {
            CheckPermission(GetPermissionName);
        }

        protected virtual void CheckGetAllPermission()
        {
            CheckPermission(GetAllPermissionName);
        }

        protected virtual void CheckCreatePermission()
        {
            CheckPermission(CreatePermissionName);
        }

        protected virtual void CheckUpdatePermission()
        {
            CheckPermission(UpdatePermissionName);
        }

        protected virtual void CheckDeletePermission()
        {
            CheckPermission(DeletePermissionName);
        }
    }

}
