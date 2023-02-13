using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Localization;
using NHibernate.Linq;
using Shesha.Bootstrappers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Languages
{
    /// <summary>
    /// South Africa languages bootstrapper. Register this bootstrapper in the main module to automatically create south africa languages
    /// </summary>
    public class SouthAfricaLanguagesCreator: IBootstrapper
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<ApplicationLanguage> _repository;

        public SouthAfricaLanguagesCreator(IUnitOfWorkManager unitOfWorkManager, IRepository<ApplicationLanguage> repository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _repository = repository;
        }

        public static List<ApplicationLanguage> InitialLanguages { get; private set; }

        static SouthAfricaLanguagesCreator()
        {
            InitialLanguages = new List<ApplicationLanguage>
            {
                new ApplicationLanguage(null, "eng", "English", "famfamfam-flags eng"),
                new ApplicationLanguage(null, "zul", "IsiZulu", "famfamfam-flags zul"),
                new ApplicationLanguage(null, "xho", "IsiXhosa", "famfamfam-flags xho"),
                new ApplicationLanguage(null, "afr", "Afrikaans", "famfamfam-flags afr"),
                new ApplicationLanguage(null, "nso", "Sepedi", "famfamfam-flags nso"),
                new ApplicationLanguage(null, "sot", "Sesotho", "famfamfam-flags sot"),
                new ApplicationLanguage(null, "tsn", "Setswana", "famfamfam-flags tsn"),
                new ApplicationLanguage(null, "tso", "Xitsonga", "famfamfam-flags tso"),
                new ApplicationLanguage(null, "ssw", "IsiSwati", "famfamfam-flags ssw"),
                new ApplicationLanguage(null, "ven", "Tshivenda", "famfamfam-flags ven"),
                new ApplicationLanguage(null, "nde", "IsiNdebele", "famfamfam-flags nde"),
                new ApplicationLanguage(null, "sgn", "Sign Language", "famfamfam-flags sgn"),
            };
        }

        public async Task Process()
        {
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                foreach (var language in InitialLanguages)
                {
                    await AddLanguageIfNotExistsAsync(language);
                }
            }
        }
        private async Task AddLanguageIfNotExistsAsync(ApplicationLanguage language)
        {
            if (await _repository.GetAll().AnyAsync(l => l.TenantId == language.TenantId && l.Name == language.Name))
                return;

            await _repository.InsertAsync(language);
        }
    }
}
