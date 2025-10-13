using Abp.Domain.Repositories;
using Shesha.Domain;
using System;

namespace Shesha.ConfigurationStudio
{
    /// <summary>
    /// Configuration tree manager
    /// </summary>
    public class ConfigurationTreeManager
    {
        private readonly IRepository<ConfigurationItemFolder, Guid> _folderRepo;
        //private readonly IRepository<ConfigurationItem, Guid> _itemRepo;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ConfigurationTreeManager(
            IRepository<ConfigurationItemFolder, Guid> folderRepo
        )
        {
            _folderRepo = folderRepo;
        }
    }
}
