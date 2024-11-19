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
using Shesha.Extensions;
using Shesha.Migrations;
using Shesha.NHibernate.Maps;
using Shesha.Reflection;
using Shesha.Services.Dtos;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services
{
    /// <summary>
    /// NHibernate application service
    /// </summary>
    public class NHibernateAppService: IApplicationService
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public NHibernateAppService(IUnitOfWorkManager unitOfWorkManager)
        {
            _unitOfWorkManager = unitOfWorkManager;
        }

        /// <summary>
        /// Get last compiled mapping conventions
        /// </summary>
        /// <returns></returns>
        [DontWrapResult]
        public Task<string> GetConventions()
        {
            return Task.FromResult(Conventions.LastCompiledXml);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [DontWrapResult]
        public IList ExecuteHql([FromForm] ExecuteHqlInput input)
        {
            var sessionFactory = StaticContext.IocManager.Resolve<ISessionFactory>();
            var session = sessionFactory.GetCurrentSession();
            var list = session.CreateQuery(input.Query).List();
            return list;
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
                var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();
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

        /// <summary>
        /// NOTE: to be removed
        /// </summary>
        [HttpGet]
        [DontWrapResult]
        public void TestEntity(string entityType) 
        {
            var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();
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
                    var session = sessionFactory.GetCurrentSession();
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
