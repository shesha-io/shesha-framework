using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Cryptography.Xml;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public interface ICascadeEntityCreator
    {
        IIocManager IocManager { get; set; }
        object FindEntity(CascadeRuleEntityFinderInfo info);
        bool VerifyEntity(CascadeRuleEntityFinderInfo info, List<ValidationResult> validationResult);
        object PrepareEntity(CascadeRuleEntityFinderInfo info);
    }

    public abstract class CascadeEntityCreatorBase<T, TId> : ICascadeEntityCreator where T : class, IEntity<TId>
    {
        public IIocManager IocManager { get; set; }

        private CascadeRuleEntityFinderInfo<T, TId> GetNewInfo(CascadeRuleEntityFinderInfo info)
        {
            return new CascadeRuleEntityFinderInfo<T, TId>((T)info._NewObject)
            {
                _Repository = (IRepository<T, TId>)info._Repository ?? IocManager.Resolve<IRepository<T, TId>>(),
            };
        }

        public object FindEntity(CascadeRuleEntityFinderInfo info)
        {
            return FindEntity(GetNewInfo(info));
        }
        public object PrepareEntity(CascadeRuleEntityFinderInfo info)
        {
            return PrepareEntity(GetNewInfo(info));
        }

        public bool VerifyEntity(CascadeRuleEntityFinderInfo info, List<ValidationResult> validationResult)
        {
            var errors = new List<ValidationResult>();
            VerifyEntity(GetNewInfo(info), errors);
            validationResult.AddRange(errors);
            return !errors.Any();
        }

        /// <summary>
        /// Override this function to find Entity
        /// </summary>
        /// <param name="info">Input data</param>
        /// <returns>Found Entity. Null if not found. Throw exception <see cref="CascadeUpdateRuleException"/> if found any constraints</returns>
        /// <exception cref="CascadeUpdateRuleException">Throw exception of this type if found any constraints</exception>
        public virtual T FindEntity(CascadeRuleEntityFinderInfo<T, TId> info)
        {
            return null;
        }

        /// <summary>
        /// Override this function to prepare new Entity
        /// </summary>
        /// <param name="info">Input data</param>
        /// <returns>Found Entity. Null if not found. Throw exception <see cref="CascadeUpdateRuleException"/> if found any constraints</returns>
        /// <exception cref="CascadeUpdateRuleException">Throw exception of this type if found any constraints</exception>
        public virtual T PrepareEntity(CascadeRuleEntityFinderInfo<T, TId> info)
        {
            return info.NewObject;
        }

        /// <summary>
        /// Override this function to validate input
        /// </summary>
        /// <param name="info">Input data</param>
        /// <param name="errors">Errors</param>
        /// <returns>Found Entity. Null if not found. Throw exception <see cref="CascadeUpdateRuleException"/> if found any constraints</returns>
        /// <exception cref="CascadeUpdateRuleException">Throw exception of this type if found any constraints</exception>
        public virtual void VerifyEntity(CascadeRuleEntityFinderInfo<T, TId> info, List<ValidationResult> errors)
        {
        }

    }

    public class CascadeRuleEntityFinderInfo
    {
        public CascadeRuleEntityFinderInfo(object newObject)
        {
            _NewObject = newObject;
        }

        public object _NewObject { get; set; }
        public IRepository _Repository { get; set; }
    }

    public class CascadeRuleEntityFinderInfo<T, TId> : CascadeRuleEntityFinderInfo where T : class, IEntity<TId>
    {
        public CascadeRuleEntityFinderInfo(T newObject) : base(newObject)
        {
        }

        public T NewObject => (T)_NewObject;
        public IRepository<T, TId> Repository => (IRepository<T, TId>)_Repository;
    }

    /// <summary>
    /// Throw exception of this type if found any constraints
    /// </summary>
    public class CascadeUpdateRuleException : Exception
    {
        public CascadeUpdateRuleException(string message) : base(message)
        {

        }
    }

}
