using Abp.Application.Services;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Extensions;
using Shesha.Migrations;
using Shesha.Mvc;
using Shesha.NHibernate.Maps;
using Shesha.NHibernate.Session;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Services
{
    /// <summary>
    /// NHibernate application service
    /// </summary>
    public class NHibernateAppService: IApplicationService
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly INhCurrentSessionContext _currentSessionContext;

        public NHibernateAppService(IUnitOfWorkManager unitOfWorkManager, INhCurrentSessionContext currentSessionContext)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _currentSessionContext = currentSessionContext;
        }

        /// <summary>
        /// Get last compiled mapping conventions
        /// </summary>
        /// <returns></returns>
        [DontWrapResult]
        public Task<ShaFileContentResult> GetConventionsAsync()
        {
            return Task.FromResult(new ShaFileContentResult(Encoding.UTF8.GetBytes(Conventions.LastCompiledXml ?? string.Empty), "application/xml") { FileDownloadName = "nhibernate_mappings.xml" });
        }

        /// <summary>
        /// NOTE: to be removed
        /// </summary>
        [HttpGet]
        [DontWrapResult]
        public string TestEntities()
        {
            try
            {
                var typeFinder = StaticContext.IocManager.Resolve<IShaTypeFinder>();
                var migrationGenerator = StaticContext.IocManager.Resolve<IMigrationGenerator>();

                var types = typeFinder.FindAll().Where(t => t.IsEntityType()
                    && t != typeof(AggregateRoot)
                    && t != typeof(UserPermissionSetting)
                    && t != typeof(RolePermissionSetting)
                    ).ToList();

                var errors = new Dictionary<Type, Exception>();

                foreach (var type in types)
                {
                    TryFetch(type, e => errors.Add(type, e));                    
                }

                var typesToMap = errors.Select(e => e.Key).Where(t => !(t.Namespace ?? "").StartsWith("Abp") && !t.HasAttribute<ImMutableAttribute>()).ToList();

                var migration = migrationGenerator.GenerateMigrations(typesToMap);

                var grupped = migrationGenerator.GroupByPrefixes(typesToMap);
                var grouppedMigrations = grupped.Select(g => new { Prefix = g.Key, Migration = migrationGenerator.GenerateMigrations(g.Value) })
                    .ToList();

                
                return migration;
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpGet]
        [DontWrapResult]
        public string GenerateMigration(string entityType) 
        {
            var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();
            var type = typeFinder.Find(t => t.FullName == entityType).Single();
            var migrationGenerator = StaticContext.IocManager.Resolve<IMigrationGenerator>();

            var migration = migrationGenerator.GenerateMigrations([type]);
            return migration;
        }

        /// <summary>
        /// NOTE: to be removed
        /// </summary>
        [HttpGet]
        [DontWrapResult]
        public void TestEntity(string entityType) 
        {
            var typeFinder = StaticContext.IocManager.Resolve<IShaTypeFinder>();
            var type = typeFinder.Find(t => t.FullName == entityType).Single();
            TryFetch(type, e => 
            {
                throw e;
            });
        }

        private void TryFetch(Type type, Action<Exception> onException) 
        {
            var sessionFactory = StaticContext.IocManager.Resolve<ISessionFactory>();

            using (var uow = _unitOfWorkManager.Begin(System.Transactions.TransactionScopeOption.RequiresNew))
            {
                try
                {
                    var hql = $"from {type.FullName}";
                    var session = _currentSessionContext.Session;
                    var list = session.CreateQuery(hql).SetMaxResults(1).List();
                }
                catch (Exception e)
                {
                    onException.Invoke(e);                    
                }
                uow.Complete();
            }
        }
    }
}
