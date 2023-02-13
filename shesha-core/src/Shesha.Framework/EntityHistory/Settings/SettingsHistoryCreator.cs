using System;
using System.Collections.Generic;
using Abp.Json;
using Abp.Configuration;
using Abp.Dependency;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Abp.Extensions;
using Abp.Runtime.Session;

namespace Shesha.EntityHistory.Settings
{
    public class SettingsHistoryCreator : IEntityHistoryCreator, ITransientDependency
    {
        private readonly ISettingDefinitionManager _settingDefinitionManager;

        public SettingsHistoryCreator(ISettingDefinitionManager settingDefinitionManager)
        {
            _settingDefinitionManager = settingDefinitionManager;
        }

        public bool TypeAllowed(Type type)
        {
            return typeof(Setting).IsAssignableFrom(type);
        }

        public EntityChange GetEntityChange(object entity, IAbpSession abpSession, string[] propertyNames, object[] loadedState, object[] currentState, Int32[] dirtyProps)
        {
            var setting = entity as Setting;
            if (setting == null) return null;

            var entityChange = new EntityChange
            {
                ChangeType = EntityChangeType.Updated,
                ChangeTime = DateTime.Now,
                EntityEntry = entity, // [NotMapped]
                EntityId = setting.Name + (setting.UserId != null ? "@" + setting.UserId : ""),
                EntityTypeFullName = typeof(Setting).FullName,
                TenantId = abpSession.TenantId,
            };

            object oldValue;
            object newValue;
            var valueIndex = Array.IndexOf(propertyNames, nameof(Setting.Value));

            if (loadedState == null)
            {
                // changed from default
                newValue = currentState[valueIndex];
                oldValue = _settingDefinitionManager.GetSettingDefinition(setting.Name)?.DefaultValue; //default
            }
            else if (dirtyProps == null)
            {
                // delete = restored to default
                newValue = $"default ({_settingDefinitionManager.GetSettingDefinition(setting.Name)?.DefaultValue})"; //default
                oldValue = loadedState[valueIndex];
            }
            else
            {
                // changed
                newValue = currentState[valueIndex];
                oldValue = loadedState[valueIndex];
            }

            var propChange = new EntityPropertyChange()
            {
                OriginalValue = oldValue?.ToJsonString().TruncateWithPostfix(EntityPropertyChange.MaxValueLength),
                NewValue = newValue?.ToJsonString().TruncateWithPostfix(EntityPropertyChange.MaxValueLength),
                PropertyName = nameof(Setting.Value),
                PropertyTypeFullName = typeof(string).FullName,
                TenantId = abpSession.TenantId,
            };

            entityChange.PropertyChanges = new List<EntityPropertyChange>() { propChange };

            return entityChange;
        }
    }
}