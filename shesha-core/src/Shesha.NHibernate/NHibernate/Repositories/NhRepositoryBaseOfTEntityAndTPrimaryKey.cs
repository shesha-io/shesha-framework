using Abp.Collections.Extensions;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Linq;
using Shesha.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Shesha.NHibernate.Repositories
{
    /// <summary>
    /// Base class for all repositories those uses NHibernate.
    /// </summary>
    /// <typeparam name="TEntity">Entity type</typeparam>
    /// <typeparam name="TPrimaryKey">Primary key type of the entity</typeparam>
    public class NhRepositoryBase<TEntity, TPrimaryKey> : AbpRepositoryBase<TEntity, TPrimaryKey>
        where TEntity : class, IEntity<TPrimaryKey>
    {
        /// <summary>
        /// Gets the NHibernate session object to perform database operations.
        /// </summary>
        public virtual ISession Session { get { return _sessionProvider.Session; } }

        /// <summary>
        /// Reference to the current UOW provider.
        /// </summary>
        public ICurrentUnitOfWorkProvider CurrentUnitOfWorkProvider { get; set; }

        /// <summary>
        /// Reference to the specifications manager.
        /// </summary>
        public ISpecificationManager SpecificationManager { get; set; }

        private readonly ISessionProvider _sessionProvider;

        /// <summary>
        /// Creates a new <see cref="NhRepositoryBase{TEntity,TPrimaryKey}"/> object.
        /// </summary>
        /// <param name="sessionProvider">A session provider to obtain session for database operations</param>
        public NhRepositoryBase(ISessionProvider sessionProvider)
        {
            _sessionProvider = sessionProvider;

            SpecificationManager = default!;
            CurrentUnitOfWorkProvider = default!;
        }

        public IQueryable<TEntity> QueryAll() 
        {
            var query = Session.Query<TEntity>();

            return SpecificationManager.ApplySpecifications<TEntity>(query);
        }

        public override IQueryable<TEntity> GetAll()
        {
            return QueryAll();
        }

        public override async Task<IQueryable<TEntity>> GetAllAsync()
        {
            return await Task.FromResult(QueryAll());
        }

        public override IQueryable<TEntity> GetAllIncluding(params Expression<Func<TEntity, object>>[] propertySelectors)
        {
            if (propertySelectors.IsNullOrEmpty())
            {
                return GetAll();
            }

            var query = GetAll();

            foreach (var propertySelector in propertySelectors)
            {
                //TODO: Test if NHibernate supports multiple fetch.
                query = query.Fetch(propertySelector);
            }

            return query;
        }

        public override Task<List<TEntity>> GetAllListAsync()
        {
            return QueryAll().ToListAsync();
        }

        public override Task<List<TEntity>> GetAllListAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return QueryAll().Where(predicate).ToListAsync();
        }

        public override Task<TEntity> SingleAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return QueryAll().SingleAsync(predicate);
        }

        public override TEntity FirstOrDefault(TPrimaryKey id)
        {
            return Session.Get<TEntity>(id);
        }

        public override Task<TEntity> FirstOrDefaultAsync(TPrimaryKey id)
        {
            return Session.GetAsync<TEntity>(id);
        }

        public override async Task<TEntity> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await QueryAll().FirstOrDefaultAsync(predicate);
        }

        public override TEntity Load(TPrimaryKey id)
        {
            return Session.Load<TEntity>(id);
        }

        public override TEntity Insert(TEntity entity)
        {
            Session.Save(entity);
            return entity;
        }

        public override async Task<TEntity> InsertAsync(TEntity entity)
        {
            await Session.SaveAsync(entity);
            return entity;
        }

        public override TEntity InsertOrUpdate(TEntity entity)
        {
            Session.SaveOrUpdate(entity);
            return entity;
        }

        public override async Task<TEntity> InsertOrUpdateAsync(TEntity entity)
        {
            await Session.SaveOrUpdateAsync(entity);
            return entity;
        }

        public override TEntity Update(TEntity entity)
        {
            Session.Update(entity);
            return entity;
        }

        public override async Task<TEntity> UpdateAsync(TEntity entity)
        {
            await Session.UpdateAsync(entity);
            return entity;
        }

        protected virtual int? GetCurrentTenantIdOrNull()
        {
            if (CurrentUnitOfWorkProvider?.Current != null)
            {
                return CurrentUnitOfWorkProvider.Current.GetTenantId();
            }

            return null;
        }

        protected virtual bool IsHardDeleteEntity(TEntity entity)
        {
            if (CurrentUnitOfWorkProvider?.Current?.Items == null)
            {
                return false;
            }

            if (!CurrentUnitOfWorkProvider.Current.Items.ContainsKey(UnitOfWorkExtensionDataTypes.HardDelete))
            {
                return false;
            }

            var hardDeleteItems = CurrentUnitOfWorkProvider.Current.Items[UnitOfWorkExtensionDataTypes.HardDelete];
            if (!(hardDeleteItems is HashSet<string> objects))
            {
                return false;
            }

            var currentTenantId = GetCurrentTenantIdOrNull();
            var hardDeleteKey = EntityHelper.GetHardDeleteKey(entity, currentTenantId);
            return objects.Contains(hardDeleteKey);
        }

        public override void Delete(TEntity entity)
        {
            var isHardDelete = IsHardDeleteEntity(entity);

            if (!isHardDelete && entity is ISoftDelete softDeleteEntity)
            {
                softDeleteEntity.IsDeleted = true;
                Update(entity);
            }
            else
            {
                Session.Delete(entity);
            }
        }

        public override void Delete(TPrimaryKey id)
        {
            var entity = Load(id);

            Delete(entity);
        }

        public override async Task DeleteAsync(TEntity entity)
        {
            var isHardDelete = IsHardDeleteEntity(entity);

            if (!isHardDelete && entity is ISoftDelete softDeleteEntity)
            {
                softDeleteEntity.IsDeleted = true;
                await UpdateAsync(entity);
            }
            else
            {
                await Session.DeleteAsync(entity);
            }
        }

        public override async Task DeleteAsync(TPrimaryKey id)
        {
            var entity = Load(id);

            await DeleteAsync(entity);
        }

        public override async Task DeleteAsync(Expression<Func<TEntity, bool>> predicate)
        {
            var entities = await GetAllListAsync(predicate);

            foreach (var entity in entities)
            {
                await DeleteAsync(entity);
            }
        }

        public override Task<int> CountAsync()
        {
            return QueryAll().CountAsync();
        }

        public override Task<int> CountAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return QueryAll().CountAsync(predicate);
        }

        public override Task<long> LongCountAsync()
        {
            return QueryAll().LongCountAsync();
        }

        public override Task<long> LongCountAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return QueryAll().LongCountAsync(predicate);
        }
    }

    internal class UnitOfWorkExtensionDataTypes
    {
        public static string HardDelete { get; } = "HardDelete";
    }
}