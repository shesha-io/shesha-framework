using Shesha.Cache;
using Shesha.ConfigurationItems.Models;
using Shesha.Web.FormsDesigner.Dtos;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Cache
{
    public interface IFormCacheHolder : ICacheHolder<string, FormConfigurationDto>
    {
        bool IsEnabled { get; }

        Task EnableAsync();

        Task DisableAsync();

        string GetCacheKey(string module, string name, ConfigurationItemViewMode mode);
    }
}
