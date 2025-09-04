using Abp.Dependency;
using Abp.Runtime.Session;
using NHibernate.Linq;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Permissions;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Form manager
    /// </summary>
    public class FormManager : ConfigurationItemManager<FormConfiguration>, IFormManager, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        
        public FormManager(IPermissionedObjectManager permissionedObjectManager) : base()
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public static string GetFormPermissionedObjectName(string? module, string name)
        {
            return $"{module}.{name}";
        }

        public Task<List<FormConfiguration>> GetAllAsync()
        {
            return Repository.GetAllListAsync();
        }

        protected override Task CopyItemPropertiesAsync(FormConfiguration source, FormConfiguration destination)
        {
            destination.Markup = source.Markup;
            destination.IsTemplate = source.IsTemplate;
            
            return Task.CompletedTask;
        }

        protected override async Task AfterItemDuplicatedAsync(FormConfiguration item, FormConfiguration duplicate)
        {
            await _permissionedObjectManager.CopyAsync(
                GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                GetFormPermissionedObjectName(duplicate.Module?.Name, duplicate.Name),
                ShaPermissionedObjectsTypes.Form
            );
        }
    }
}