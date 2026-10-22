using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Roles;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.ShaRole
{
    public class ShaRole_Test : SheshaNhTestBase
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IShaRoleManager _shaRoleManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<Domain.ShaRole, Guid> _roleRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _appointmentRepository;

        public ShaRole_Test()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
            _roleRepository = Resolve<IRepository<Domain.ShaRole, Guid>>();
            _shaRoleManager = Resolve<IShaRoleManager>();
            _appointmentRepository = Resolve<IRepository<ShaRoleAppointedPerson, Guid>>();
        }

        [Fact]
        public async Task TestAddToRoleAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var role = await _roleRepository.GetAll().FirstOrDefaultAsync(x => x.Name == "ShaRole_Test_@#");
                if (role == null)
                {
                    role = new Domain.ShaRole() { Name = "ShaRole_Test_@#" };
                    await _roleRepository.InsertAsync(role);
                    await _unitOfWorkManager.Current.SaveChangesAsync();
                }

                Person person = await _personRepository.GetAll().FirstOrDefaultAsync(); ;
                ShaRoleAppointedPerson appointment = await _appointmentRepository.GetAll().FirstOrDefaultAsync(x => x.Person == person && x.Role == role);
                if (appointment != null)
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await _appointmentRepository.DeleteAsync(appointment);
                    }
                    await _unitOfWorkManager.Current.SaveChangesAsync();
                }

                var result = await _shaRoleManager.AddToRoleAsync(person, role);
                try
                {
                    Assert.True(result.Succeeded);
                    Assert.NotNull(result.ShaRoleAppointment);
                    Assert.Equal(person, result.ShaRoleAppointment.Person);
                    Assert.Equal(role, result.ShaRoleAppointment.Role);

                    var resultFailed = await _shaRoleManager.AddToRoleAsync(person, role);

                    Assert.False(resultFailed.Succeeded);
                    Assert.True(resultFailed.Errors.Any());
                    Assert.NotNull(resultFailed.ShaRoleAppointment);
                    Assert.Equal(person, resultFailed.ShaRoleAppointment.Person);
                    Assert.Equal(role, resultFailed.ShaRoleAppointment.Role);

                    var apps = await _shaRoleManager.GetRolesForPersonAsync(person);
                    Assert.Contains(role, apps);

                    var resultRemove = await _shaRoleManager.RemoveFromRoleAsync(person, role);
                    Assert.True(resultRemove.Succeeded);
                    Assert.Null(resultRemove.ShaRoleAppointment);

                    var appsEmpty = await _shaRoleManager.GetRolesForPersonAsync(person);
                    Assert.DoesNotContain(role, appsEmpty);
                }
                finally
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await _appointmentRepository.DeleteAsync(result.ShaRoleAppointment);
                        await _roleRepository.DeleteAsync(role);
                    }
                }

                await uow.CompleteAsync();
            }
        }

        [Fact]
        public async Task TestAddToRoleWithDataAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var role = await _roleRepository.GetAll().FirstOrDefaultAsync(x => x.Name == "ShaRole_Test_@#");
                if (role == null)
                {
                    role = new Domain.ShaRole() { Name = "ShaRole_Test_@#" };
                    await _roleRepository.InsertAsync(role);
                    await _unitOfWorkManager.Current.SaveChangesAsync();
                }

                Person person = await _personRepository.GetAll().FirstOrDefaultAsync();
                ShaRoleAppointedPerson appointment = await _appointmentRepository.GetAll().FirstOrDefaultAsync(x => x.Person == person && x.Role == role);
                if (appointment != null)
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await _appointmentRepository.DeleteAsync(appointment);
                    }
                    await _unitOfWorkManager.Current.SaveChangesAsync();
                }

                var data = new ShaRoleAppointmentData();
                data.PermissionedEntities.Add(person);
                data.PermissionedEntities.Add(role);

                var result = await _shaRoleManager.AddToRoleAsync(person, role, data);
                try
                {
                    Assert.True(result.Succeeded);
                    Assert.NotNull(result.ShaRoleAppointment);
                    Assert.Equal(person, result.ShaRoleAppointment.Person);
                    Assert.Equal(role, result.ShaRoleAppointment.Role);
                    Assert.Contains(person, result.ShaRoleAppointment.PermissionedEntities);
                    Assert.Contains(role, result.ShaRoleAppointment.PermissionedEntities);

                    var resultFailed = await _shaRoleManager.AddToRoleAsync(person, role, data);

                    Assert.False(resultFailed.Succeeded);
                    Assert.True(resultFailed.Errors.Any());
                    Assert.NotNull(resultFailed.ShaRoleAppointment);
                    Assert.Equal(person, resultFailed.ShaRoleAppointment.Person);
                    Assert.Equal(role, resultFailed.ShaRoleAppointment.Role);
                    Assert.Contains(person, result.ShaRoleAppointment.PermissionedEntities);
                    Assert.Contains(role, result.ShaRoleAppointment.PermissionedEntities);

                    var apps = await _shaRoleManager.GetRolesForPersonAsync(person, data);
                    Assert.Contains(role, apps);

                    var failData = new ShaRoleAppointmentData();
                    failData.PermissionedEntities.Add(result.ShaRoleAppointment);

                    var failApps = await _shaRoleManager.GetRolesForPersonAsync(person, failData);
                    Assert.DoesNotContain(role, failApps);

                    var resultRemove = await _shaRoleManager.RemoveFromRoleAsync(person, role, data);
                    Assert.True(resultRemove.Succeeded);
                    Assert.Null(resultRemove.ShaRoleAppointment);

                    var appsEmpty = await _shaRoleManager.GetRolesForPersonAsync(person, data);
                    Assert.DoesNotContain(role, appsEmpty);
                }
                finally
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await _appointmentRepository.DeleteAsync(result.ShaRoleAppointment);
                        await _roleRepository.DeleteAsync(role);
                    }
                }

                await uow.CompleteAsync();
            }
        }
    }
}
