using Abp.Domain.Entities;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.DeferredUpdate
{
    public abstract class BaseDeferredUpdateManager<TDeferredUpdateData> : IDeferredUpdateManager
    {

        public TDeferredUpdateData GetData(object data)
        {
            if (data is JObject jData)
                return jData.ToObject<TDeferredUpdateData>();
            if (data is TDeferredUpdateData typedItem)
                return typedItem;
            return default;
        }

        public virtual async Task ExecuteUpdateAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DeferredUpdateItem> items, List<ValidationResult> validationResult)
        {
            try
            {
                foreach (var item in items)
                {
                    TDeferredUpdateData data = GetData(item.Data);
                    await UpdateItemAsync(entity, item.Id, data, validationResult);
                }
            }
            catch (Exception e)
            {
                validationResult.Add(new ValidationResult(e.Message));
            }
        }

        public abstract Task UpdateItemAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, object id, TDeferredUpdateData data, List<ValidationResult> validationResult);

        public abstract bool IsApplicable(string type);
    }
}
