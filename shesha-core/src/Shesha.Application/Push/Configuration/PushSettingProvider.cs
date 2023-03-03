using Abp.Dependency;
using Shesha.Configuration;
using Shesha.Settings;

namespace Shesha.Push.Configuration
{
    /// <summary>
    /// Push notifications setting provider
    /// </summary>
    public class PushSettingProvider: SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryPush = "Push";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(
                    SheshaSettingNames.Push.PushNotifier,
                    NullPushNotifier.Uid,
                    "Push Notifier"
                )
                { Category = CategoryPush }
            );
        }
    }
}
