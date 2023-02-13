using Abp.Domain.Entities;
using Shesha.Extensions;
using Shesha.Services;
using System;

namespace Shesha.EntityReferences
{
    public class GenericEntityReference : IGenericEntityReference
    {
        private object _entity;

        public GenericEntityReference(string id, string typeName, string dysplayName = null)
        {
            Id = id;
            _className = typeName;
            _displayName = dysplayName;
        }

        public GenericEntityReference(object entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            _entity = entity;
            Id = _entity.GetType().GetProperty("Id")?.GetValue(_entity)?.ToString();
            _className = _entity.GetType().FullName;
            _displayName = _entity.GetDisplayName();
        }

        public virtual string Id { get; internal set; }

        public virtual string _className { get; internal set; }

        public virtual string _displayName { get; internal set; }

        public static implicit operator Entity<Guid>(GenericEntityReference reference) => GetEntity<Guid>(reference);
        private static Entity<T> GetEntity<T>(GenericEntityReference reference)
        {
            if (reference._entity == null)
            {
                var repo = StaticContext.IocManager.Resolve<IDynamicRepository>();
                reference._entity = repo.Get(reference._className, reference.Id);
            }
            return (Entity<T>)reference._entity;
        }

        public static implicit operator GenericEntityReference(Entity<Guid> entity) => SetEntity(entity);
        private static GenericEntityReference SetEntity<T>(Entity<T> entity)
        {
            return new GenericEntityReference(entity);
        }
    }
}
