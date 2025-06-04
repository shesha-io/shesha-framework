using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Notifications;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Metadata;
using Shesha.Reflection;
using Stubble.Core;
using Stubble.Core.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.FormTemplates
{
    public class TemplateGenerator: ITemplateGenerator, ITransientDependency
    {
        private readonly IEnumerable<IGenerationLogic> _generationLogics;
        private readonly IRepository<FormConfiguration, Guid> _formConfigurationRepo;
        private readonly StubbleVisitorRenderer _stubbleRenderer = new StubbleBuilder().Configure(settings =>
        {
            settings.SetIgnoreCaseOnKeyLookup(true);
            settings.AddValueGetter(typeof(GenericEntityReference), (object value, string key, bool ignoreCase) => {
                if (value is GenericEntityReference entityRef)
                {
                    var entity = (Entity<Guid>)entityRef;
                    if (entity == null)
                        return null;

                    var propAccessor = ReflectionHelper.GetPropertyValueAccessor(entity, key);
                    return propAccessor.IsValueAvailable
                        ? propAccessor.Value
                        : null;
                }
                else
                    return null;
            });
            settings.AddValueGetter(typeof(NotificationData), (object value, string key, bool ignoreCase) => {
                if (value is NotificationData templateData)
                {
                    return templateData[key];
                }
                else
                    return null;
            });

        }).Build();
        public IIocManager IocManager { get; set; } = default!;

        public TemplateGenerator(IEnumerable<IGenerationLogic> generationLogics, IRepository<FormConfiguration, Guid> formConfigurationRepo)
        {
            _generationLogics = generationLogics;
            _formConfigurationRepo = formConfigurationRepo;
        }

        public async Task<string> GenerateTemplateAsync(Guid templateId, string data)
        {
            var template = await _formConfigurationRepo.GetAsync(templateId);

            if (template == null)
                throw new Exception($"Template with ID {templateId} not found.");

            var generationLogic = _generationLogics.FirstOrDefault(x => x.GetType().Name == template.GenerationLogicTypeName);

            if (generationLogic == null)
                throw new Exception($"Generation logic {template.GenerationLogicTypeName} not found.");

            var metadataAppService = IocManager.Resolve<IMetadataAppService>();

            var templateMarkup = template.Markup != null
                ? await generationLogic.PrepareTemplateAsync(template.Markup, data, _stubbleRenderer, metadataAppService)
                : String.Empty;

            return templateMarkup;
        }
    }
}
