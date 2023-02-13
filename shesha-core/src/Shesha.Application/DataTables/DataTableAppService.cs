using Abp.Dependency;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Runtime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.DataTables
{
    public class DataTableAppService: SheshaAppServiceBase, ITransientDependency
    {
        private readonly IEntityConfigurationStore _entityConfigStore;
        private readonly IDataTableHelper _helper;

        public DataTableAppService(IEntityConfigurationStore entityConfigStore, IDataTableHelper helper)
        {
            _entityConfigStore = entityConfigStore;
            _helper = helper;
        }

        /// <summary>
        /// Returns datatable columns for configurable table. Accepts type of model(entity) and list of properties.
        /// Columns configuration is merged on the client side with configurable values
        /// </summary>
        [HttpPost]
        public async Task<List<DataTableColumnDto>> GetColumnsAsync(GetColumnsInput input, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(input.EntityType))
                throw new AbpValidationException($"'{nameof(input.EntityType)}' must not be null");

            var entityType = !string.IsNullOrWhiteSpace(input.EntityType)
                ? _entityConfigStore.Get(input.EntityType)
                : null;
            if (entityType == null)
                throw new AbpValidationException($"Entity of type `{input.EntityType}` not found");

            var columns = await GetColumnsForPropertiesAsync(entityType.EntityType, input.Properties);

            var dtos = columns.Select(c => ObjectMapper.Map<DataTableColumnDto>(c)).ToList();

            return dtos;
        }

        private async Task<List<DataTableColumn>> GetColumnsForPropertiesAsync(Type rowType, List<string> properties)
        {
            var columns = new List<DataTableColumn>();
            foreach (var property in properties)
            {
                var column = await _helper.GetDisplayPropertyColumnAsync(rowType, property, property);
                columns.Add(column);
            }

            return columns;
        }
    }
}
