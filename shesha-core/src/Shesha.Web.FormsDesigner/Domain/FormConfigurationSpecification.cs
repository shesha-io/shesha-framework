using Abp.Domain.Uow;
using Shesha.Specifications;
using System;
using System.Linq.Expressions;

namespace Shesha.Web.FormsDesigner.Domain
{
    [GlobalSpecification]
    public class FormConfigurationSpecification : ShaSpecification<FormConfiguration>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public FormConfigurationSpecification(IUnitOfWorkManager unitOfWorkManager)
        {
            _unitOfWorkManager = unitOfWorkManager;
        }


        public override Expression<Func<FormConfiguration, bool>> BuildExpression()
        {
            var filterEnabled = _unitOfWorkManager.Current.IsFilterEnabled(AbpDataFilters.SoftDelete);
            return filterEnabled
                ? f => !f.Configuration.IsDeleted
                : f => true;
        }
    }
}
