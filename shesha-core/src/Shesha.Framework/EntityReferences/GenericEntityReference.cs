using Abp.Domain.Entities;
using Newtonsoft.Json;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using System;

namespace Shesha.EntityReferences
{
    [Serializable]
    public class GenericEntityReference : IEquatable<GenericEntityReference>, IGenericEntityReference
    {
        private object? _entity;

        [JsonConstructor]
        public GenericEntityReference(string id, string _className, string? _displayName = null)
        {
            Id = id;
            this._className = _className;
            this._displayName = _displayName;
        }

        public GenericEntityReference(object entity)
        {
            if (entity == null) 
                throw new ArgumentNullException(nameof(entity));
            _entity = entity;
            if (_entity.GetType().GetProperty("Id") == null)
                throw new NullReferenceException($"entity.{nameof(GenericEntityReference.Id)} not found");
            var id = _entity.GetType().GetProperty("Id")?.GetValue(_entity)?.ToString();
            if (string.IsNullOrWhiteSpace(id))
                throw new NullReferenceException($"entity.{nameof(GenericEntityReference.Id)} can not be NULL");

            Id = id;
            _className = _entity.GetType().StripCastleProxyType().GetRequiredFullName();
            _displayName = _entity.GetEntityDisplayName();
        }

        [JsonProperty("id")]
        public virtual string Id { get; internal set; }

        public virtual string _className { get; internal set; }

        public virtual string? _displayName { get; internal set; }

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

        public override bool Equals(object? obj) => this.Equals(obj as GenericEntityReference);

        public bool Equals(GenericEntityReference? obj)
        {
            return obj != null && 
                Id == obj.Id && _className == obj._className;
        }

        public static bool operator ==(GenericEntityReference? l, GenericEntityReference? r)
        {
            if (l is null)
            {
                if (r is null)
                    return true;
                // Only the left side is null.
                return false;
            }
            // Equals handles case of null on right side.
            return l.Equals(r);
        }

        public static bool operator !=(GenericEntityReference? l, GenericEntityReference? r) => !(l == r);

        public override int GetHashCode()
        {
            return string.IsNullOrWhiteSpace(Id)
                ? 0 
                : Id.GetHashCode();
        }
    }
}