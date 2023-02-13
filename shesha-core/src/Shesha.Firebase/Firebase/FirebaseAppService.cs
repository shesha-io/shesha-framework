using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.Attributes;
using Shesha.Domain;
using Shesha.Firebase.Dtos;
using Shesha.Push.Dtos;

namespace Shesha.Firebase
{
    [ClassUid(Uid)]
    [Description("Firebase")]
    public class FirebaseAppService: ApplicationService, IFirebaseAppService
    {
        /// <summary>
        /// Unique identifier of the <see cref="FirebaseAppService"/> class, is used for references instead of class name
        /// </summary>
        public const string Uid = "8DF00E45-1F6D-4CE6-82E8-A4C59497DCAE";

        private readonly IRepository<Person, Guid> _personRepository;
        private IRepository<DeviceRegistration, Guid> _deviceRepository;
        private readonly IFirebaseApplicationManager _firebaseApplicationProvider;

        public FirebaseAppService(IRepository<Person, Guid> personRepository, IRepository<DeviceRegistration, Guid> deviceRepository, IFirebaseApplicationManager firebaseApplicationProvider)
        {
            _personRepository = personRepository;
            _deviceRepository = deviceRepository;
            _firebaseApplicationProvider = firebaseApplicationProvider;
        }

        /// <summary>
        /// Updates Firebase settings
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task UpdateSettings([FromForm] UpdateFirebaseSettingsInput input)
        {
            if (input.File == null)
                throw new AbpValidationException("File is mandatory");

            await using (var fileStream = input.File.OpenReadStream())
            {
                await _firebaseApplicationProvider.UpdateServiceAccountJson(fileStream);
            }
        }

        /// <summary>
        /// Send notification to topic
        /// </summary>
        /// <param name="input"></param>
        /// <returns>response from the Firebase API</returns>
        public async Task<string> SendNotificationToTopic(SendNotificationToTopicInput input)
        {
            var message = new Message()
            {
                Topic = input.Topic,
                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Body = input.Body,
                    Title = input.Title
                },
                Data = input.Data
            };

            var app = _firebaseApplicationProvider.GetApplication();
            var messaging = FirebaseMessaging.GetMessaging(app);

            return await messaging.SendAsync(message);
        }

        /// <summary>
        /// Sends notification to a person
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task SendNotificationToPersonAsync(SendNotificationToPersonInput input)
        {
            var validationResults = new List<ValidationResult>();

            Person person = null;
            if (input.PersonId == Guid.Empty)
                validationResults.Add(new ValidationResult($"'{nameof(input.PersonId)}' is mandatory"));
            else
            {
                person = await _personRepository.GetAll().Where(p => p.Id == input.PersonId).FirstOrDefaultAsync();
                if (person == null)
                    validationResults.Add(new ValidationResult("Person not found"));
            }

            if (validationResults.Any())
                throw new AbpValidationException("Failed to send message", validationResults);

            var app = _firebaseApplicationProvider.GetApplication();
            var messaging = FirebaseMessaging.GetMessaging(app);

            var devices = await _deviceRepository.GetAll().Where(d => d.Person == person).ToListAsync();
            foreach (var device in devices)
            {
                try
                {
                    var message = new Message()
                    {
                        Token = device.DeviceRegistrationId,
                        Notification = new FirebaseAdmin.Messaging.Notification()
                        {
                            Body = input.Body,
                            Title = input.Title
                        },
                        Data = input.Data
                    };

                    await messaging.SendAsync(message);
                }
                catch (FirebaseMessagingException e)
                {
                    // 
                }
            }
        }

        /*
        public Task SendNotificationToPersonAsync(ISendNotificationToPersonDto input)
        {
            throw new NotImplementedException();
        }
        */
    }
}
