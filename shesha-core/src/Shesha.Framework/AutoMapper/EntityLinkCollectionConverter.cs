using System;
using System.Collections.Generic;
using System.Linq;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Services;

namespace Shesha.AutoMapper
{
    /// <summary>
    /// Entity list update after receiving the list of EntityLinks from client. Note: OwnerKey+OwnerId is the key here, this is not to be used for cases when Id is the key
    /// </summary>
    public class EntityLinkCollectionConverter<TSrc, TDest, TPk> : ITypeConverter<List<TSrc>, List<TDest>> where TSrc: EntityLinkDto where TDest: Entity<TPk>, IHasOwningEntityLink
    {
        /// <summary>
        /// 
        /// </summary>
        public List<TDest> Convert(List<TSrc> sourceItems, List<TDest> destinationItems, ResolutionContext context)
        {
            if (sourceItems == null)
                return destinationItems;

            // When mapping to a new object, create new collection
            var destinationCollection = destinationItems ?? Activator.CreateInstance<List<TDest>>();
            
            var repository = StaticContext.IocManager.Resolve<IRepository<TDest, TPk>>();

            // Update values (key is owner type + id), there rest is values. Id should be ignored
            TDest destinationItem = null;
            foreach(var sourceItem in sourceItems.Where(source => 
                (destinationItem = destinationCollection.FirstOrDefault(c => c.OwnerType == source.EntityType && c.OwnerId == source.EntityId)) != null))
            {
                var originalId = destinationItem.Id;
                destinationItem = context.Mapper.Map(sourceItem, destinationItem);
                // Id should be ignored even if exists in DTO because (EntityType,EntityId) is the Id for this mapping
                if (!destinationItem.Id.Equals(originalId))
                    destinationItem.Id = originalId;
                repository.Update(destinationItem);
            }

            // Add missing items
            foreach (var newItem in sourceItems.Where(source =>
                !destinationCollection.Any(c => c.OwnerType == source.EntityType && c.OwnerId == source.EntityId)))
            {
                var newEntity = context.Mapper.Map<TDest>(newItem);
                repository.Insert(newEntity);
                destinationCollection.Add(newEntity);
            }

            // Delete / soft delete missing items
            if (destinationItems != null && destinationItems.Any())
            {
                foreach (var missingItem in destinationItems.Where(source =>
                    !sourceItems.Any(c => c.EntityType == source.OwnerType && c.EntityId == source.OwnerId)))
                {
                    // Delete or Soft Delete is chosen by interceptor
                    repository.Delete(missingItem);
                }
            }

            return destinationCollection;
        }
    }
}
