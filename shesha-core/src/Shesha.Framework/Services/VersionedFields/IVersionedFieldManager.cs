using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Services.VersionedFields
{
    /// <summary>
    /// Versioned field manager
    /// </summary>
    public interface IVersionedFieldManager
    {
        /// <summary>
        /// Get versioned field value
        /// </summary>
        /// <typeparam name="TEntity"></typeparam>
        /// <typeparam name="TId"></typeparam>
        /// <param name="owner"></param>
        /// <param name="fieldName"></param>
        /// <returns></returns>
        Task<string> GetVersionedFieldValueAsync<TEntity, TId>(TEntity owner, string fieldName) where TEntity : IEntity<TId>;

        /// <summary>
        /// Set versioned field value
        /// </summary>
        /// <typeparam name="TEntity"></typeparam>
        /// <typeparam name="TId"></typeparam>
        /// <param name="owner"></param>
        /// <param name="fieldName"></param>
        /// <param name="value"></param>
        /// <param name="createNewVersion"></param>
        /// <returns></returns>
        Task SetVersionedFieldValueAsync<TEntity, TId>(TEntity owner, string fieldName, string value, bool createNewVersion) where TEntity : IEntity<TId>;
    }
}
