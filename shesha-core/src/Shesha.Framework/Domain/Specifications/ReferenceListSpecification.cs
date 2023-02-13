using Abp.Domain.Uow;
using Shesha.Specifications;
using System;
using System.Linq.Expressions;

namespace Shesha.Domain.Specifications
{
    [GlobalSpecification]
    public class ReferenceListSpecification : ShaSpecification<ReferenceList>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ReferenceListSpecification(IUnitOfWorkManager unitOfWorkManager)
        {
            _unitOfWorkManager = unitOfWorkManager;
        }

        public override Expression<Func<ReferenceList, bool>> BuildExpression()
        {
            var filterEnabled = _unitOfWorkManager.Current.IsFilterEnabled(AbpDataFilters.SoftDelete);
            return filterEnabled
                ? f => !f.Configuration.IsDeleted
                : f => true;
        }
    }
}
