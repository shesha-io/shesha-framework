using System.Linq;
using Abp;
using Abp.Domain.Uow;
using Abp.Extensions;
using NHibernate;
using Shesha.NHibernate.UoW;

namespace Shesha.NHibernate.Uow
{
    /// <summary>
    /// NHibernate filter executer
    /// </summary>
    public class NhUnitOfWorkFilterExecuter : IUnitOfWorkFilterExecuter
    {
        /// inheritedDoc
        public void ApplyDisableFilter(IUnitOfWork unitOfWork, string filterName)
        {
            if (SkipProcessing(unitOfWork, out var session))
                return;

            if (session.GetEnabledFilter(filterName) != null)
            {
                session.DisableFilter(filterName);
            }
        }

        /// inheritedDoc
        public void ApplyEnableFilter(IUnitOfWork unitOfWork, string filterName)
        {
            if (SkipProcessing(unitOfWork, out var session))
                return;

            if (session.GetEnabledFilter(filterName) == null)
            {
                session.EnableFilter(filterName);

                // Note: NH doesn't store parameter values for disabled filters, so we have to apply values again (simply read values from the configuration and fill NH filter parameters)
                var filterConfig = unitOfWork.Filters.FirstOrDefault(f => f.FilterName == filterName);
                if (filterConfig == null)
                    throw new AbpException("Unknown filter name: " + filterName + ". Be sure this filter is registered before.");

                foreach (var filterParameterConfig in filterConfig.FilterParameters)
                {
                    // set NH filter parameter value
                    ApplyFilterParameterValue(unitOfWork, filterName, filterParameterConfig.Key, filterParameterConfig.Value);
                }
            }
        }

        /// inheritedDoc
        public void ApplyFilterParameterValue(IUnitOfWork unitOfWork, string filterName, string parameterName, object value)
        {
            if (SkipProcessing(unitOfWork, out var session))
                return;

            var filter = session.GetEnabledFilter(filterName);

            filter?.SetParameter(parameterName, value);
        }

        /// <summary>
        /// Returns true if the processing should be skipped. Session may be null if session factory uses lazy sessions
        /// Note: we can safely skip enable/disable and parameters actions, state of the filters are stored as part of the <see cref="UnitOfWorkBase"/> and can be reapplied at any moment
        /// </summary>
        /// <param name="unitOfWork"></param>
        /// <param name="session"></param>
        /// <returns></returns>
        private bool SkipProcessing(IUnitOfWork unitOfWork, out ISession session)
        {
            session = unitOfWork is NhUnitOfWork nhUnitOwWork
                ? nhUnitOwWork.GetSession(false)
                : null;

            return session == null;
        }
    }
}
