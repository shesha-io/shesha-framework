using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Domain.Interfaces;
using System.Collections.Generic;

namespace Shesha.Domain
{
    public class EntityCrudConfig : IEntityCrudConfig
    {
        public CrudActions CrudActions { get; private set; }

        public CrudActionsAccess CrudActionsAccess { get; private set; }

        public string[] CrudActionsPermissions { get; private set; }

        public bool IsConfigurable { get; private set; }

        public bool IsImmutable { get; private set; }

        public static IEntityCrudConfig Default => new EntityCrudConfig()
        {
            IsConfigurable = true,
            CrudActions = CrudActions.None,
            CrudActionsAccess = CrudActionsAccess.Inherited,
            CrudActionsPermissions = new string[] { },
        };

        public void MakeImmutable()
        {
            CrudActions = CrudActions & ~(CrudActions.Create | CrudActions.Update | CrudActions.Delete);
            IsImmutable = true;
        }

        public EntityCrudConfig()
        {
            
        }

        public EntityCrudConfig(EntityAttribute source)
        {
            CrudActions = source.CrudActions;
            CrudActionsAccess = source.CrudActionsAccess;
            CrudActionsPermissions = source.CrudActionsPermissions;
            IsConfigurable = source.IsConfigurable;
        }

        public virtual void CopyFrom(IEntityCrudConfig source)
        {
            CrudActions = source.CrudActions;
            CrudActionsAccess = source.CrudActionsAccess;
            CrudActionsPermissions = source.CrudActionsPermissions;
            IsConfigurable = source.IsConfigurable;
        }
    }

    public class EntityCrudConfigWithCustomActions : EntityCrudConfig, IEntityCrudConfigWithCustomActions
    {
        public Dictionary<CrudAction, ICrudActionConfig> CustomActionConfig { get; private set; } = new();

        public static IEntityCrudConfigWithCustomActions ApplyActionRules(IEntityCrudConfig config, CrudAction action, ICrudActionConfig actionConfig)
        {
            var result = new EntityCrudConfigWithCustomActions(config);
            result.CustomActionConfig[action] = actionConfig;
            return result;            
        }

        public EntityCrudConfigWithCustomActions(IEntityCrudConfig config)
        {
            CopyFrom(config);
        }

        public override void CopyFrom(IEntityCrudConfig source)
        {
            base.CopyFrom(source);
            if (source is IEntityCrudConfigWithCustomActions withCustomActions)
                CustomActionConfig = new(withCustomActions.CustomActionConfig);
        }
    }
}
