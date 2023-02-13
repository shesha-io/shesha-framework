using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading.Tasks;
using Abp.Configuration;
using Abp.Domain.Uow;
using Shesha.Configuration;
using Shesha.NHibernate.UoW;
using Shesha.Reflection;
using Shesha.Services;
using Shouldly;
using Xunit;

namespace Shesha.Tests.Settings
{
    public class SettingsAudit_Tests : SheshaNhTestBase
    {

        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ISettingManager _settingManager;

        public SettingsAudit_Tests()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _settingManager = Resolve<ISettingManager>();
        }

        [Fact]
        public async Task Save_Test()
        {
            LoginAsHostAdmin();
            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    var testSetting = _settingManager.GetSettingValue("TestSetting");
                    testSetting.ShouldNotBeNull();

                    _settingManager.ChangeSettingForApplication("TestSetting", "2");
                    session.Flush();

                    session.CreateSQLQuery("select count(1) from AbpSettings where Name = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(1);
                    session.CreateSQLQuery(
                            "select count(1) from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(1);
                    session.CreateSQLQuery("select count(1) from AbpEntityChanges where EntityId = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(1);
                    session.CreateSQLQuery("select count(1) from AbpEntityChangeSets where id in (select EntityChangeSetId from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(1);
                }
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    var testSetting = _settingManager.GetSettingValue("TestSetting");
                    testSetting.ShouldNotBeNull();

                    _settingManager.ChangeSettingForApplication("TestSetting", "3");
                    session.Flush();
                    session.CreateSQLQuery("select count(1) from AbpSettings where Name = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(1);
                    session.CreateSQLQuery(
                            "select count(1) from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(2);
                    session.CreateSQLQuery("select count(1) from AbpEntityChanges where EntityId = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(2);
                    session.CreateSQLQuery("select count(1) from AbpEntityChangeSets where id in (select EntityChangeSetId from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(2);
                }
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    var testSetting = _settingManager.GetSettingValue("TestSetting");
                    testSetting.ShouldNotBeNull();

                    _settingManager.ChangeSettingForApplication("TestSetting", "1");
                    session.Flush();
                    session.CreateSQLQuery("select count(1) from AbpSettings where Name = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(0);
                    session.CreateSQLQuery(
                            "select count(1) from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(3);
                    session.CreateSQLQuery("select count(1) from AbpEntityChanges where EntityId = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(3);
                    session.CreateSQLQuery("select count(1) from AbpEntityChangeSets where id in (select EntityChangeSetId from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(3);
                }
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    var testSetting = _settingManager.GetSettingValue("TestSetting");
                    testSetting.ShouldNotBeNull();

                    _settingManager.ChangeSettingForApplication("TestSetting", "2");
                    session.Flush();
                    session.CreateSQLQuery("select count(1) from AbpSettings where Name = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(1);
                    session.CreateSQLQuery(
                            "select count(1) from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(4);
                    session.CreateSQLQuery("select count(1) from AbpEntityChanges where EntityId = 'TestSetting'")
                        .UniqueResult<int>().ShouldBe(4);
                    session.CreateSQLQuery("select count(1) from AbpEntityChangeSets where id in (select EntityChangeSetId from AbpEntityChanges where EntityId = 'TestSetting')")
                        .UniqueResult<int>().ShouldBe(4);
                }
            }
            finally
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    // delete temporary values
                    var entityChangeSetId = 
                        session.CreateSQLQuery("select EntityChangeSetId from AbpEntityChanges where EntityId = 'TestSetting'")
                            .List<Int64>();

                    session.CreateSQLQuery("delete from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId = 'TestSetting')")
                        .ExecuteUpdate();
                    session.CreateSQLQuery("delete from AbpEntityChanges where EntityId = 'TestSetting'")
                        .ExecuteUpdate();
                    foreach (var id in entityChangeSetId)
                    {
                        session.CreateSQLQuery($"delete from AbpEntityChangeSets where id = {id}")
                            .ExecuteUpdate();
                    }
                    session.CreateSQLQuery($"delete from AbpSettings where Name = 'TestSetting'")
                        .ExecuteUpdate();

                    session.Flush();
                }
            }
        }

        [Fact]
        public async Task SaveTwoSettings_Test()
        {
            LoginAsHostAdmin();
            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    var testSetting = _settingManager.GetSettingValue("TestSetting");
                    testSetting.ShouldNotBeNull();
                    var testSetting2 = _settingManager.GetSettingValue("TestSetting2");
                    testSetting2.ShouldNotBeNull();

                    _settingManager.ChangeSettingForApplication("TestSetting", "2");
                    _settingManager.ChangeSettingForApplication("TestSetting2", "b");
                    session.Flush();
                }
            }
            finally
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    // delete temporary values
                    var entityChangeSetId =
                        session.CreateSQLQuery("select EntityChangeSetId from AbpEntityChanges where EntityId like 'TestSetting%'")
                            .List<Int64>();

                    session.CreateSQLQuery("delete from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId like 'TestSetting%')")
                        .ExecuteUpdate();
                    session.CreateSQLQuery("delete from AbpEntityChanges where EntityId like 'TestSetting%'")
                        .ExecuteUpdate();
                    foreach (var id in entityChangeSetId)
                    {
                        session.CreateSQLQuery($"delete from AbpEntityChangeSets where id = {id}")
                            .ExecuteUpdate();
                    }
                    session.CreateSQLQuery($"delete from AbpSettings where Name like 'TestSetting%'")
                        .ExecuteUpdate();

                    session.Flush();
                }
            }
        }

        [Fact]
        public async Task SaveNullDefaultSettings_Test()
        {
            LoginAsHostAdmin();
            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    var testSetting = _settingManager.GetSettingValue("TestSetting");
                    testSetting.ShouldNotBeNull();
                    var testSetting2 = _settingManager.GetSettingValue("TestSetting2");
                    testSetting2.ShouldNotBeNull();

                    _settingManager.ChangeSetting("TestSetting", "2");
                    _settingManager.ChangeSetting("TestSetting2", "b");

                    /*var testSetting2 = _settingManager.GetSettingValue("NullTestSetting.Round1");
                    testSetting2.ShouldBeNull();*/
                    
                    _settingManager.ChangeSetting("TestSetting.Boxfusion.Shesha.GDE.LowestPriorityApplicationTypeToProcessOffersFor.Round1", 9.ToString());
                    session.Flush();
                }
            }
            finally
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;
                    var session = nhuow?.GetSession();

                    // delete temporary values
                    var entityChangeSetId =
                        session.CreateSQLQuery("select EntityChangeSetId from AbpEntityChanges where EntityId like '%TestSetting%'")
                            .List<Int64>();

                    session.CreateSQLQuery("delete from AbpEntityPropertyChanges where EntityChangeId in (select id from AbpEntityChanges where EntityId like '%TestSetting%')")
                        .ExecuteUpdate();
                    session.CreateSQLQuery("delete from AbpEntityChanges where EntityId like '%TestSetting%'")
                        .ExecuteUpdate();
                    foreach (var id in entityChangeSetId)
                    {
                        session.CreateSQLQuery($"delete from AbpEntityChangeSets where id = {id}")
                            .ExecuteUpdate();
                    }
                    session.CreateSQLQuery($"delete from AbpSettings where Name like '%TestSetting%'")
                        .ExecuteUpdate();

                    session.Flush();
                }
            }
        }

    }
}
