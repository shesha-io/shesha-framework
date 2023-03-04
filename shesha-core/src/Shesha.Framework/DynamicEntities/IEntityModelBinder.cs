using Newtonsoft.Json.Linq;
using Shesha.DynamicEntities.Binder;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public interface IEntityModelBinder
    {
        Task<bool> BindPropertiesAsync(JObject jobject, object entity, EntityModelBindingContext context,
            string propertyName = null, List<string> formFields = null);

        /// <summary>
        /// Deletes nested entities from properties that configured as CascadeDeleteUnreferenced (Attributte or PropertyConfig)
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        Task<bool> DeleteCascadeAsync(object entity);
    }
}
