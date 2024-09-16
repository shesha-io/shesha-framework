import React, { createContext, useContext } from 'react';

interface SearchQueryContextType {
    searchQuery: string;
    onChange: (value: string) => void;
}

const SearchQueryContext = createContext<SearchQueryContextType | undefined>(undefined);

export const useSearchQuery = () => {
    const context = useContext(SearchQueryContext);
    if (context === undefined) {
        throw new Error('useSearchQuery must be used within a SearchQueryProvider');
    }
    return context;
};

export const SearchQueryProvider: React.FC<SearchQueryContextType & { children: React.ReactNode }> = ({ searchQuery, children, onChange }) => {
    return (
        <SearchQueryContext.Provider value={{ searchQuery, onChange }}>
            {children}
        </SearchQueryContext.Provider>
    );
};