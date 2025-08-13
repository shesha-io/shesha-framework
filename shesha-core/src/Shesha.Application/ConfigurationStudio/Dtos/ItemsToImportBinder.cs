using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationStudio.Dtos
{
    public class ItemsToImportBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            var targetType = bindingContext.ModelMetadata.ModelType;
            if (targetType.IsClass && !targetType.IsAbstract && typeof(ICollection<Guid>).IsAssignableFrom(targetType))
            {
                var model = bindingContext.Model as ICollection<Guid>;
                if (model == null)
                    model = ActivatorHelper.CreateNotNullObject(targetType).ForceCastAs<ICollection<Guid>>();

                var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);

                if (valueProviderResult != ValueProviderResult.None)
                {
                    foreach (var value in valueProviderResult.Values)
                    {
                        if (!string.IsNullOrWhiteSpace(value)) 
                        {
                            var items = JsonConvert.DeserializeObject<List<Guid>>(value).NotNull();
                            foreach (var item in items)
                                model.Add(item);
                        }                        
                    }

                    bindingContext.Result = ModelBindingResult.Success(model);
                }
                else
                    bindingContext.Result = ModelBindingResult.Failed();
            }

            return Task.CompletedTask;
        }
    }
}
