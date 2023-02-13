using Shesha.Domain.Enums;
using System;
using System.Data;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// Notification DB helper
    /// </summary>
    internal class NotificationDbHelper
    {
        private readonly IDbConnection _connection;
        private readonly IDbTransaction _transaction;

        public NotificationDbHelper(IDbConnection connection, IDbTransaction transaction)
        {
            _connection = connection;
            _transaction = transaction;
        }

        #region private declarations
        private void ExecuteNonQuery(string sql, Action<IDbCommand> prepareAction = null)
        {
            ExecuteCommand(sql, command => {
                prepareAction?.Invoke(command);
                command.ExecuteNonQuery();
            });
        }

        private T ExecuteScalar<T>(string sql, Action<IDbCommand> prepareAction = null)
        {
            T result = default(T);
            ExecuteCommand(sql, command => {
                prepareAction?.Invoke(command);
                result = (T)command.ExecuteScalar();
            });
            return result;
        }

        private void ExecuteCommand(string sql, Action<IDbCommand> action)
        {
            using (var command = _connection.CreateCommand())
            {
                command.Transaction = _transaction;
                command.CommandText = sql;

                action.Invoke(command);
            }
        }

        #endregion

        #region Notifications

        internal Guid InsertNotification(string @namespace, string name, string description)
        {
            var id = Guid.NewGuid();
            var sql = @"INSERT INTO Core_Notifications
           (Id
           ,Description
           ,Name
           ,Namespace)
     VALUES
           (
		   @id
           ,@description
           ,@name
           ,@namespace
		   )";

            ExecuteNonQuery(sql, command => {
                command.AddParameter("@id", id);
                command.AddParameter("@description", description);
                command.AddParameter("@name", name);
                command.AddParameter("@namespace", @namespace);
            });
            return id;
        }

        internal void UpdateNotificationDescription(Guid? id, string description)
        {
            ExecuteNonQuery("update Core_Notifications set Description = @Description where Id = @Id", command => {
                command.AddParameter("@Description", description);
                command.AddParameter("@Id", id);
            });
        }

        internal Guid? GetNotificationId(string @namespace, string name)
        {
            return ExecuteScalar<Guid?>(@"select Id from Core_Notifications where Namespace = @Namespace and Name = @Name", command => {
                command.AddParameter("@namespace", @namespace);
                command.AddParameter("@name", name);
            });
        }

        internal void DeleteNotification(string @namespace, string name)
        {
            ExecuteNonQuery(@"delete from Core_Notifications where Namespace = @Namespace and Name = @Name",
                command => {
                    command.AddParameter("@namespace", @namespace);
                    command.AddParameter("@name", name);
                }
            );
        }

        #endregion

        #region Templates

        internal Guid InsertNotificationTemplate(Guid notificationId, NotificationTemplateDefinition notification)
        {
            var id = notification.Id.IsSet
                ? notification.Id.Value
                : Guid.NewGuid();
            var sql = @"INSERT INTO Core_NotificationTemplates
           (Id
           ,Name
           ,NotificationId
           ,IsEnabled)
     VALUES
           (@Id
           ,@Name
           ,@NotificationId
           ,@IsEnabled)";

            ExecuteNonQuery(sql, command => {
                command.AddParameter("@Id", id);
                command.AddParameter("@Name", notification.Name.Value);
                command.AddParameter("@NotificationId", notificationId);
                command.AddParameter("@IsEnabled", notification.IsEnabled.Value);
            });

            return id;
        }

        internal void DeleteNotificationTemplates(string @namespace, string name)
        {
            var id = GetNotificationId(@namespace, name);
            if (id == null)
                return;

            ExecuteNonQuery(@"delete from Core_NotificationTemplates where NotificationId = @NotificationId",
                command => {
                    command.AddParameter("@NotificationId", id);
                }
            );
        }

        internal void DeleteNotificationTemplate(Guid id)
        {
            ExecuteNonQuery(@"delete from Core_NotificationTemplates where Id = @Id",
                command => {
                    command.AddParameter("@Id", id);
                }
            );
        }

        internal void UpdateTemplateName(Guid templateId, string name)
        {
            ExecuteNonQuery("update Core_NotificationTemplates set Name = @Name where Id = @Id", command => {
                command.AddParameter("@Name", name);
                command.AddParameter("@Id", templateId);
            });
        }

        internal void UpdateTemplateSubject(Guid templateId, string subject)
        {
            ExecuteNonQuery("update Core_NotificationTemplates set Subject = @Subject where Id = @Id", command => {
                command.AddParameter("@Subject", subject);
                command.AddParameter("@Id", templateId);
            });
        }

        internal void UpdateTemplateBody(Guid templateId, string body)
        {
            ExecuteNonQuery("update Core_NotificationTemplates set Body = @Body where Id = @Id", command => {
                command.AddParameter("@Body", body);
                command.AddParameter("@Id", templateId);
            });
        }

        internal void UpdateTemplateBodyFormat(Guid templateId, RefListNotificationTemplateType templateType)
        {
            ExecuteNonQuery("update Core_NotificationTemplates set BodyFormatLkp = @BodyFormatLkp where Id = @Id", command => {
                command.AddParameter("@BodyFormatLkp", (int)templateType);
                command.AddParameter("@Id", templateId);
            });
        }

        internal void UpdateTemplateSendType(Guid templateId, RefListNotificationType sendType)
        {
            ExecuteNonQuery("update Core_NotificationTemplates set SendTypeLkp = @SendTypeLkp where Id = @Id", command => {
                command.AddParameter("@SendTypeLkp", (int)sendType);
                command.AddParameter("@Id", templateId);
            });
        }

        
        internal void UpdateTemplateIsEnabled(Guid templateId, bool isEnabled)
        {
            ExecuteNonQuery("update Core_NotificationTemplates set IsEnabled = @IsEnabled where Id = @Id", command => {
                command.AddParameter("@IsEnabled", isEnabled);
                command.AddParameter("@Id", templateId);
            });
        }

        #endregion
    }
}
