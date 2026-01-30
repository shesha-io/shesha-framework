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
using System.ComponentModel;
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

            ItemTypes = BuildItemTypesDictionary();
            ItemTypeDtos = BuildItemTypeDtos(ItemTypes);
            ItemTypeByDiscriminator = BuildItemTypeByDiscriminator(ItemTypeDtos);
        }

        protected Dictionary<string, Type> ItemTypes;
        protected List<IConfigurationItemTypeDto> ItemTypeDtos;
        protected Dictionary<string, string> ItemTypeByDiscriminator;

        private Dictionary<string, Type> BuildItemTypesDictionary()
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

        public Type GetTypeByDiscriminator(string discriminator)
        {
            return ItemTypes[discriminator];
        }

        public IConfigurationItemManager GetManager(ConfigurationItem item)
        {
            return _iocManager.GetItemManager(item) ?? throw new ConfigurationItemManagerNotFoundException(item.GetType().Name);
        }

        public IConfigurationItemManager GetManagerByDiscriminator(string discriminator)
        {
            var runtimeType = GetTypeByDiscriminator(discriminator);
            return _iocManager.GetItemManager(runtimeType) ?? throw new ConfigurationItemManagerNotFoundException(runtimeType.Name);
        }

        public string GetDiscriminator(Type itemType)
        {
            return ItemTypes.Single(e => e.Value == itemType).Key;
        }

        private Type? GetParentType(Type type)
        {
            var chain = type.GetFullChain(t => t.BaseType)
                .SkipWhile(t => t == type)
                .TakeWhile(t => t.IsAssignableTo(typeof(ConfigurationItem)) && !t.IsAbstract && !t.IsGenericType && t != typeof(ConfigurationItem))
                .ToList();
            return chain.FirstOrDefault();
        }

        private string GetItemType(Type type)
        {
            var instance = Activator.CreateInstance(type).ForceCastAs<ConfigurationItem>();
            return instance.ItemType;
        }

        private List<IConfigurationItemTypeDto> BuildItemTypeDtos(Dictionary<string, Type> itemTypes) 
        { 
            return itemTypes
                .Where(t => t.Value != typeof(ConfigurationItem))
                .Select(t => {
                    var browsable = t.Value.GetAttributeOrNull<BrowsableAttribute>();
                    if (browsable != null && !browsable.Browsable)
                        return null;

                    var config = _entityConfigStore.Get(t.Value);

                    var attrs = t.Value.GetCustomAttributes<FixedViewAttribute>() ?? new List<FixedViewAttribute>();

                    var itemType = GetItemType(t.Value);

                    var parentType = GetParentType(t.Value);
                    var parentItemType = parentType != null ? GetDiscriminator(parentType) : null;

                    return new ConfigurationItemTypeDto
                    {
                        ItemType = itemType,
                        Discriminator = t.Key,
                        ParentType = parentItemType,
                        EntityClassName = t.Value.FullName.NotNull(),
                        Description = t.Value.GetDescription(),
                        FriendlyName = config.FriendlyName,
                        CreateFormId = attrs.SingleOrDefault(a => a.ViewType == ConfigurationItemsViews.Create)?.FormId,
                        RenameFormId = attrs.SingleOrDefault(a => a.ViewType == ConfigurationItemsViews.Rename)?.FormId,
                    };
                })
                .WhereNotNull()
                .Cast<IConfigurationItemTypeDto>()
                .ToList();
        }

        private Dictionary<string, string> BuildItemTypeByDiscriminator(List<IConfigurationItemTypeDto> itemTypeDtos)
        {
            return itemTypeDtos.ToDictionary(e => e.Discriminator, e => e.ItemType);
        }

        /// <summary>
        /// Get available configuration item types
        /// </summary>
        public Task<List<IConfigurationItemTypeDto>> GetAvailableItemTypesAsync()
        {
            return Task.FromResult(ItemTypeDtos);
        }

        public string GetItemTypeByDiscriminator(string discriminator)
        {
            return ItemTypeByDiscriminator.TryGetValue(discriminator, out var itemType) ? itemType : string.Empty;
        }
    }
}
