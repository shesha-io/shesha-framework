using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using System;

namespace Shesha.Domain
{
    /// Role and user builder
    /// </summary>
    public class HostRoleAndUserBuilder: IHostRoleAndUserBuilder, ITransientDependency
    {
        private readonly IUnitOfWorkManager _uowManager;
        private readonly IRepository<ShaRole, Guid> _roleRepository;
        private readonly IRepository<User, Int64> _userRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointmentRepository;        

        public HostRoleAndUserBuilder(IUnitOfWorkManager uowManager, IRepository<ShaRole, Guid> roleRepository, IRepository<User, Int64> userRepository, IRepository<Person, Guid> personRepository, IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository)
        {
            _uowManager = uowManager;
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _personRepository = personRepository;
            _roleAppointmentRepository = roleAppointmentRepository;
        }

        public void Create()
        {
            using (var uow = _uowManager.Begin())
            {
                CreateRolesAndUsers();
                uow.Complete();
            }
        }

        private void CreateRolesAndUsers()
        {

            // disable isDeleted filter
            var adminRole = EnsureRoleExist(StaticRoleNames.Host.Admin);
            var devRole = EnsureRoleExist(StaticRoleNames.Host.Dev);
            var configRole = EnsureRoleExist(StaticRoleNames.Host.Config);

            EnsureUserExist(User.AdminUserName, p => AddUserToRole(p, adminRole));
            EnsureUserExist(User.DevUserName, p => AddUserToRole(p, devRole));
            EnsureUserExist(User.ConfigUserName, p => AddUserToRole(p, configRole));
        }

        private void AddUserToRole(Person person, ShaRole role)
        {
            var appointment = new ShaRoleAppointedPerson { 
                Role = role,
                Person = person
            };
            _roleAppointmentRepository.Insert(appointment);
        }

        private ShaRole EnsureRoleExist(string name)
        {
            var role = _roleRepository.FirstOrDefault(r => r.TenantId == null && r.Name == name);
            if (role == null)
            {
                role = new ShaRole
                {
                    Name = name,
                    //NameSpace
                };
                role.SetHardLinkToApplication(true);
                _roleRepository.Insert(role);
            }

            return role;
        }

        private void EnsureUserExist(string username, Action<Person> afterCreateAction)
        {
            var user = _userRepository.FirstOrDefault(u => u.TenantId == null && u.UserName == username);
            if (user == null) 
            {
                user = User.CreateUser(null, username, $"{username}@host");
                user.Password = new PasswordHasher<User>(new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions())).HashPassword(user, "123qwe");
                user.IsEmailConfirmed = true;
                user.IsActive = true;
                
                _userRepository.Insert(user);

                var person = new Person 
                { 
                    User = user,
                    FirstName = username,
                    LastName = username
                };
                _personRepository.Insert(person);

                afterCreateAction?.Invoke(person);
            }
        }
    }
}