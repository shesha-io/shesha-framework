using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Firebase.Configuration
{
    /// <summary>
    /// Defines Firebase settings.
    /// </summary>
    public class FirebaseSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(
                    FirebaseSettingNames.ServiceAccountJson,
                    ""
                )
                { 
                    DisplayName = "Service Account JSON",
                    Category = "Firebase"

                }
            );
        }
    }
}
