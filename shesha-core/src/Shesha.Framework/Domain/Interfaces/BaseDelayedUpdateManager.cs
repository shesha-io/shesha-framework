using Abp.Domain.Entities;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Interfaces
{
    public abstract class BaseDelayedUpdateManager<TDelayedUpdateItem> : IDelayedUpdateManager
    {
        public TDelayedUpdateItem GetData(object data)
        {
            if (data is JObject jData)
                return jData.ToObject<TDelayedUpdateItem>();
            if (data is TDelayedUpdateItem typedItem)
                return typedItem;
            return default(TDelayedUpdateItem);
        }

        public abstract Task ExecuteAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DelayedUpdateItem> items, List<ValidationResult> validationResult);
        public abstract bool IsApplicable(string type);
    }
}
