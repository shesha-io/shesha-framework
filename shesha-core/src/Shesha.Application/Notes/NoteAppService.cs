using Abp.Domain.Repositories;
using Abp.Extensions;
using Shesha.Application.Services.Dto;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Notes.Dto;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notes
{
    public class NoteAppService : SheshaCrudServiceBase<Note, NoteDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateNoteDto, UpdateNoteDto>, INoteAppService
    {
        private readonly IModelConfigurationManager _modelConfigManager;

        public NoteAppService(
            IRepository<Note, Guid> repository,
            IModelConfigurationManager modelConfigManager
        ): base(repository)
        {
            _modelConfigManager = modelConfigManager;
        }

        private async Task<string> GetFullClassNameFromEntityTypeIdAsync(EntityTypeIdInput? ownerType)
        {
            return ((ownerType?.EntityType).IsNullOrEmpty()
                ? (await _modelConfigManager.GetByEntityTypeIdAsync(
                    new EntityTypeIdentifier(ownerType?.Module, ownerType?.Name ?? "", ownerType?.EntityType)))
                    .NotNull($"Owner type not found '{ownerType}'")
                    .FullClassName
                : ownerType?.EntityType)
                .NotNull("FullClassName should not be empty");
        }

        /// <summary>
        /// Returns the list of notes for the specified owner entity.
        /// </summary>
        //[HttpGet, Route("")]
        public async Task<List<NoteDto>> GetListAsync(GetListInput input)
        {
            var className = await GetFullClassNameFromEntityTypeIdAsync(input.OwnerType);

            var notes = await Repository.GetAll()
                .Where(c => c.OwnerId == input.OwnerId && c.OwnerType == className && (input.AllCategories || c.Category == input.Category))
                .OrderBy(c => c.CreationTime)
                .ToListAsync();
            return notes.Select(c => ObjectMapper.Map<NoteDto>(c)).ToList();
        }

        /// inheritedDoc
        public override async Task<NoteDto> CreateAsync(CreateNoteDto input)
        {
            CheckCreatePermission();

            var className = await GetFullClassNameFromEntityTypeIdAsync(input.OwnerType);

            var entity = new Note()
            {
                OwnerId = input.OwnerId,
                OwnerType = className,
                Author = await GetCurrentPersonAsync(),
                Category = input.Category,
                NoteText = input.NoteText,
                Parent = input.ParentId != null ? await Repository.GetAsync(input.ParentId.Value) : null
            };

            await Repository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }
    }
}
