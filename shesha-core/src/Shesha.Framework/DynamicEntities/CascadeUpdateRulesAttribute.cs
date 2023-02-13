using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Shesha.EntityHistory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Specifies rules of cascade update/cretate child/nested entities for bindibg Dynamic entities
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property, AllowMultiple = false)]
    public class CascadeUpdateRulesAttribute : Attribute
    {
        /// <summary>
        /// Allows to update child/nested entity
        /// </summary>
        public bool CanUpdate { get; set; }

        /// <summary>
        /// Allows to create child/nested entity
        /// </summary>
        public bool CanCreate { get; set; }

        /// <summary>
        /// Delete child/nested entity if reference was removed and the child/nested entity doesn't have nother references
        /// </summary>
        public bool DeleteUnreferenced { get; set; }

        public Type CascadeEntityCreator { get; set; }

        public CascadeUpdateRulesAttribute(bool canUpdate = false, bool canCreate = false , bool deleteUnreferenced = false, Type cascadeEntityCreator = null)
        {
            CanUpdate = canUpdate;
            CanCreate = canCreate;
            DeleteUnreferenced = deleteUnreferenced;
            CascadeEntityCreator = cascadeEntityCreator;
        }
    }
}
