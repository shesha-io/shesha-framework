import { Dropdown } from '@/components/dropdown/dropdown';
import React, { useState, useEffect } from 'react';

const MyAutoComplete = ({ 
  disabled = false, 
  options = [], 
  onSearch = (term) => {}, 
  value, 
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  console.log('MyAutoComplete', { disabled, filteredOptions, onSearch, inputValue, onChange });
  useEffect(() => {
    // Update input value when external value changes
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Filter options based on input
    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(newValue.toLowerCase())
    );
    console.log('Filtered options:', filtered);
    setFilteredOptions(filtered);
    
    // Call the onSearch callback if provided
    onSearch(newValue);
    
    // If onChange is provided, call it with the new value
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleOptionSelect = (selectedOption) => {
    setInputValue(selectedOption.label);
    if (onChange) {
      onChange(selectedOption.value);
    }
  };

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        className="autocomplete-input"
      />
      {inputValue && filteredOptions.length > 0 && (
        <Dropdown
          dataSourceType='values'
          values={filteredOptions}
          onChange={handleOptionSelect}
          open={true}
          
        />
      )}
    </div>
  );
};


export default MyAutoComplete;