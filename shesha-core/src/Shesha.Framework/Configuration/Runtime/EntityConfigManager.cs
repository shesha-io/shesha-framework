using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// inheritedDoc
    public class EntityConfigManager : ConfigurationItemManager<EntityConfig>, IEntityConfigManager, ITransientDependency
    {
        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;

        public EntityConfigManager(IRepository<EntityProperty, Guid> propertyConfigRepo) : base()
        {
            _propertyConfigRepo = propertyConfigRepo;
        }

        public async Task<List<EntityConfigDto>> GetMainDataListAsync(IQueryable<EntityConfig>? query = null, bool? implemented = null)
        {
            // Do not change to Mapper to avoid performance issues
            var result = await (query ?? Repository.GetAll())
                .Where(x => !x.IsDeleted && x.Module != null)
                .Select(x => new EntityConfigDto()
                {
                    Id = x.Id,
                    Suppress = x.Suppress,

                    Name = x.Name,
                    Module = x.Module!.Name,

                    ClassName = x.ClassName,
                    TableName = x.TableName,
                    Namespace = x.Namespace,
                    DiscriminatorValue = x.DiscriminatorValue,

                    EntityConfigType = x.EntityConfigType,

                    Label = x.Label,
                    TypeShortAlias = x.TypeShortAlias,

                    Source = x.Source,
                }).ToListAsync();

            return implemented ?? false
                ? result.Where(x => !x.NotImplemented).ToList()
                : result;
        }

        protected async Task CopyPropertiesAsync(EntityConfig source, EntityConfig destination)
        {
            var properties = await _propertyConfigRepo.GetAllListAsync(x => x.EntityConfig == source);
            foreach (var src in properties)
            {
                var property = new EntityProperty 
                { 
                    EntityConfig = destination,
                    Name = src.Name,
                    DataType = src.DataType
                };

                property.Label = src.Label;
                property.Description = src.Description;
                property.DataType = src.DataType;
                property.DataFormat = src.DataFormat;
                property.EntityType = src.EntityType;
                property.ReferenceListName = src.ReferenceListName;
                property.ReferenceListModule = src.ReferenceListModule;
                property.IsFrameworkRelated = src.IsFrameworkRelated;

                property.Min = src.Min;
                property.Max = src.Max;
                property.MinLength = src.MinLength;
                property.MaxLength = src.MaxLength;
                property.Suppress = src.Suppress;
                property.Audited = src.Audited;
                property.Required = src.Required;
                property.ReadOnly = src.ReadOnly;
                property.RegExp = src.RegExp;
                property.ValidationMessage = src.ValidationMessage;

                property.CascadeCreate = src.CascadeCreate;
                property.CascadeUpdate = src.CascadeUpdate;
                property.CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced;

                await _propertyConfigRepo.InsertOrUpdateAsync(property);
            }
        }

        protected override async Task CopyItemPropertiesAsync(EntityConfig source, EntityConfig destination)
        {
            destination.ClassName = source.ClassName;
            destination.Namespace = source.Namespace;
            destination.DiscriminatorValue = source.DiscriminatorValue;
            destination.TableName = source.TableName;
            destination.EntityConfigType = source.EntityConfigType;

            destination.TypeShortAlias = source.TypeShortAlias;
            destination.HardcodedPropertiesMD5 = source.HardcodedPropertiesMD5;
            destination.ViewConfigurations = source.ViewConfigurations.Select(v => v.Clone()).ToList();
            destination.GenerateAppService = source.GenerateAppService;
            destination.Source = source.Source;
            destination.Accessor = source.Accessor;

            await CopyPropertiesAsync(source, destination);
        }
    }
}
