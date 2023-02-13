using System;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using NHibernate.Linq;
using Shesha.Web.FormsDesigner.Domain;
using Shesha.Web.FormsDesigner.Dtos;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Sql configurable component store. Uses DB table as a storage
    /// </summary>
    public class SqlConfigurableComponentStore : IConfigurableComponentStore, ITransientDependency
    {
        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; } = NullObjectMapper.Instance;

        private readonly IRepository<ConfigurableComponent, Guid> _componentRepository;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="componentRepository"></param>
        public SqlConfigurableComponentStore(IRepository<ConfigurableComponent, Guid> componentRepository)
        {
            _componentRepository = componentRepository;
        }

        /// inheritedDoc
        public async Task<ConfigurableComponentDto> GetAsync(Guid id)
        {
            var component = await _componentRepository.GetAsync(id);
            return ObjectMapper.Map<ConfigurableComponentDto>(component);
        }

        /// inheritedDoc
        public async Task<ConfigurableComponentDto> GetOrCreateAsync(Guid id)
        {
            var component = await _componentRepository.GetAll().FirstOrDefaultAsync(c => c.Id == id);
            if (component == null)
            {
                return await CreateAsync(new ConfigurableComponentDto {Id = id});
            }

            return ObjectMapper.Map<ConfigurableComponentDto>(component);
        }

        /// inheritedDoc
        public async Task<ConfigurableComponentDto> UpdateAsync(ConfigurableComponentDto dto)
        {
            var component = await _componentRepository.GetAsync(dto.Id);
            ObjectMapper.Map(dto, component);
            await _componentRepository.UpdateAsync(component);

            return ObjectMapper.Map<ConfigurableComponentDto>(component);
        }

        /// inheritedDoc
        public async Task<ConfigurableComponentDto> CreateAsync(ConfigurableComponentDto dto)
        {
            var component = ObjectMapper.Map<ConfigurableComponent>(dto);
            await _componentRepository.InsertAsync(component);

            return ObjectMapper.Map<ConfigurableComponentDto>(component);
        }
    }
}
