using Abp.Domain.Entities;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.DelayedUpdate
{
    public abstract class BaseDelayedUpdateManager<TDelayedUpdateData> : IDelayedUpdateManager
    {

        public TDelayedUpdateData GetData(object data)
        {
            if (data is JObject jData)
                return jData.ToObject<TDelayedUpdateData>();
            if (data is TDelayedUpdateData typedItem)
                return typedItem;
            return default;
        }

        public virtual async Task ExecuteUpdateAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DelayedUpdateItem> items, List<ValidationResult> validationResult)
        {
            try
            {
                foreach (var item in items)
                {
                    TDelayedUpdateData data = GetData(item.Data);
                    await UpdateItemAsync(entity, item.Id, data, validationResult);
                }
            }
            catch (Exception e)
            {
                validationResult.Add(new ValidationResult(e.Message));
            }
        }

        public abstract Task UpdateItemAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, object id, TDelayedUpdateData data, List<ValidationResult> validationResult);

        public abstract bool IsApplicable(string type);
    }
}
