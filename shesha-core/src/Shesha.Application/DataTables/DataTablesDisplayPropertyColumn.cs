using System;
using System.Reflection;
using System.Threading.Tasks;
using Abp.Domain.Entities;
using NHibernate.Util;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using EntityExtensions = Shesha.Extensions.EntityExtensions;

namespace Shesha.DataTables
{
    /// <summary>
    /// Display property column
    /// </summary>
    public class DataTablesDisplayPropertyColumn : DataTableColumn
    {
        internal DataTablesDisplayPropertyColumn() : base()
        {
        }
    }
}
