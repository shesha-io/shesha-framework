using Abp.Dependency;
using Abp.Domain.Services;
using Abp.Reflection;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using Shesha.Dto;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    public class ConfigurationItemHelper : DomainService, IConfigurationItemHelper, ISingletonDependency
    {
        private readonly IIocManager _iocManager;
        private readonly ITypeFinder _typeFinder;
        private readonly IEntityTypeConfigurationStore _entityConfigStore;

        public ConfigurationItemHelper(IIocManager iocManager, ITypeFinder typeFinder, IEntityTypeConfigurationStore entityConfigStore)
        {
            _iocManager = iocManager;
            _typeFinder = typeFinder;
            _entityConfigStore = entityConfigStore;
        }

        private Dictionary<string, Type>? _itemTypes;
        protected Dictionary<string, Type> ItemTypes => _itemTypes ?? (_itemTypes = GetItemTypesDictionary());

        private Dictionary<string, Type> GetItemTypesDictionary() 
        {
            var types = _typeFinder.Find(t => t.IsAssignableTo(typeof(ConfigurationItem)) && !t.IsAbstract && !t.IsGenericType).ToList();
            var typesWithDiscriminator = types.Select(t => {
                var config = _entityConfigStore.Get(t);
                return !string.IsNullOrWhiteSpace(config.DiscriminatorValue)
                    ? new
                    {
                        DiscriminatorValue = config.DiscriminatorValue,
                        Type = t
                    }
                    : null;
            })
                .WhereNotNull()
                .ToList();

            return typesWithDiscriminator.ToDictionary(e => e.DiscriminatorValue, e => e.Type);
        }

        public Type GetTypeByDiscriminator(string itemType)
        {
            return ItemTypes[itemType];
        }

        public IConfigurationItemManager GetManager(ConfigurationItem item)
        {
            return _iocManager.GetItemManager(item) ?? throw new ConfigurationItemManagerNotFoundException(item.GetType().Name);
        }

        public IConfigurationItemManager GetManager(string itemType)
        {
            var runtimeType = GetTypeByDiscriminator(itemType);
            return _iocManager.GetItemManager(runtimeType) ?? throw new ConfigurationItemManagerNotFoundException(runtimeType.Name);
        }

        public string GetDiscriminator(Type itemType)
        {
            return ItemTypes.Single(e => e.Value == itemType).Key;
        }

        /// <summary>
        /// Get available configuration item types
        /// </summary>

        public Task<List<IConfigurationItemTypeDto>> GetAvailableItemTypesAsync()
        {
            var itemTypes = ItemTypes
                .Where(t => t.Value != typeof(ConfigurationItem))
                .Select(t => {
                    var config = _entityConfigStore.Get(t.Value);

                    var attrs = t.Value.GetCustomAttributes<FixedViewAttribute>() ?? new List<FixedViewAttribute>();
                
                    return new ConfigurationItemTypeDto
                    {
                        ItemType = t.Key,
                        EntityClassName = t.Value.FullName.NotNull(),
                        Description = t.Value.GetDescription(),
                        FriendlyName = config.FriendlyName,
                        CreateFormId = attrs.SingleOrDefault(a => a.ViewType == ConfigurationItemsViews.Create)?.FormId,
                        RenameFormId = attrs.SingleOrDefault(a => a.ViewType == ConfigurationItemsViews.Rename)?.FormId,
                    };
                })
                .Cast<IConfigurationItemTypeDto>()
                .ToList();

            return Task.FromResult(itemTypes);
        }
    }
}
