using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using NHibernate.Linq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;
using Shesha.Locks;

namespace Shesha.Services.VersionedFields
{
    /// <summary>
    /// Versioned field manager
    /// </summary>
    public class VersionedFieldManager : IVersionedFieldManager, ITransientDependency
    {
        private readonly IRepository<VersionedField, Guid> _fieldRepository;
        private readonly IRepository<VersionedFieldVersion, Guid> _fieldVersionRepository;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly ICurrentUnitOfWorkProvider _currentUowProvider;

        public VersionedFieldManager(IRepository<VersionedField, Guid> fieldRepository, IRepository<VersionedFieldVersion, Guid> fieldVersionRepository, IEntityConfigurationStore entityConfigurationStore, ICurrentUnitOfWorkProvider currentUowProvider)
        {
            _fieldRepository = fieldRepository;
            _fieldVersionRepository = fieldVersionRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _currentUowProvider = currentUowProvider;
        }

        public async Task<VersionedField> GetVersionedFieldAsync<TEntity, TId>(TEntity owner, string fieldName) where TEntity : IEntity<TId>
        {
            var config = _entityConfigurationStore.Get(typeof(TEntity));

            return await _fieldRepository.GetAll()
                .FirstOrDefaultAsync(f => f.OwnerId == owner.Id.ToString() && f.OwnerType == config.TypeShortAlias && f.Name == fieldName);
        }

        public VersionedField GetVersionedField<TEntity, TId>(TEntity owner, string fieldName) where TEntity : IEntity<TId>
        {
            var config = _entityConfigurationStore.Get(typeof(TEntity));

            return _fieldRepository.GetAll()
                .FirstOrDefault(f => f.OwnerId == owner.Id.ToString() && f.OwnerType == config.TypeShortAlias && f.Name == fieldName);
        }

        /// <summary>
        /// Creates versioned field is missing
        /// </summary>
        public async Task<VersionedField> GetOrCreateFieldAsync<TEntity, TId>(TEntity owner, string fieldName, Action<VersionedField> initAction = null) where TEntity : IEntity<TId>
        {
            var field = await GetVersionedFieldAsync<TEntity, TId>(owner, fieldName);
            if (field != null)
                return field;

            var ioc = StaticContext.IocManager;
            var lockFactory = ioc.Resolve<ILockFactory>();
            var resource = owner.FullyQualifiedEntityId<TEntity, TId>() + "|" + fieldName;
            var expiry = TimeSpan.FromSeconds(5);
            var wait = TimeSpan.FromSeconds(2);
            var retry = TimeSpan.FromSeconds(1);

            // ToDo: AS Review frozen on async locking
            lockFactory.DoExclusive(resource, expiry, wait, retry, () =>
            {
                // trying to get the field one more time because it might be created while we were waiting for the lock
                field = GetVersionedField<TEntity, TId>(owner, fieldName) 
                        ?? CreateField<TEntity, TId>(owner, fieldName, initAction);
            });

            if (field == null)
                throw new Exception($"Failed to create versioned field, owner: {resource}, field: {fieldName}");

            return field;
        }

        public async Task<VersionedField> CreateFieldAsync<TEntity, TId>(TEntity owner, string fieldName, Action<VersionedField> initAction = null) where TEntity : IEntity<TId>
        {
            var field = new VersionedField
            {
                Name = fieldName,
            };
            initAction?.Invoke(field);
            field.SetOwner(owner);
            await _fieldRepository.InsertAsync(field);
            await _currentUowProvider.Current.SaveChangesAsync();

            return field;
        }

        public VersionedField CreateField<TEntity, TId>(TEntity owner, string fieldName, Action<VersionedField> initAction = null) where TEntity : IEntity<TId>
        {
            var field = new VersionedField
            {
                Name = fieldName,
            };
            initAction?.Invoke(field);
            field.SetOwner(owner);
            _fieldRepository.Insert(field);
            _currentUowProvider.Current.SaveChanges();

            return field;
        }

        public async Task<VersionedFieldVersion> GetLastVersionAsync(VersionedField field)
        {
            var version = await _fieldVersionRepository.GetAll().Where(v => v.Field == field).OrderByDescending(f => f.CreationTime).FirstOrDefaultAsync();
            return version;
        }

        public async Task<string> GetVersionedFieldValueAsync<TEntity, TId>(TEntity owner, string fieldName) where TEntity : IEntity<TId>
        {
            var field = await GetVersionedFieldAsync<TEntity, TId>(owner, fieldName);
            var version = field != null
                ? await GetLastVersionAsync(field)
                : null;

            return version?.Content;
        }

        public async Task SetVersionedFieldValueAsync<TEntity, TId>(TEntity owner, string fieldName, string value, bool createNewVersion) where TEntity : IEntity<TId>
        {
            var field = await GetOrCreateFieldAsync<TEntity, TId>(owner, fieldName);

            var version = await GetLastVersionAsync(field);

            // check content of the last version and skip if not changed
            if (version != null && version.Content == value)
                return;

            if (createNewVersion || version == null)
            {
                var newVersion = new VersionedFieldVersion()
                {
                    Field = field,
                    Content = value,
                };
                await _fieldVersionRepository.InsertAsync(newVersion);
            }
            else
            {
                version.Content = value;
                await _fieldVersionRepository.UpdateAsync(version);
            }
            await _currentUowProvider.Current.SaveChangesAsync();
        }
    }
}
