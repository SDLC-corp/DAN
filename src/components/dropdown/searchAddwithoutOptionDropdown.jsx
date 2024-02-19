import React, { useState } from 'react'
import { Dropdown } from 'semantic-ui-react';

const SearchAddwithoutOptionDropdown = ({
    dependencyArray,
    setDependencyArray,
    style,
    placeholder = "enter" }) => {

    const [searchQuery, setSearchQuery] = useState("")
    const stateOptions = dependencyArray.map((state) => ({
        key: state,
        text: state,
        value: state,
    }))

    const handleSearchChange = (e, { searchQuery }) => {
        setSearchQuery(searchQuery);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            setDependencyArray([...dependencyArray, searchQuery]);
            setSearchQuery('');
        }
    };
    return <>
        <Dropdown
            label="Dependency"
            placeholder={placeholder}
            fluid
            style={style}
            search
            searchQuery={searchQuery}
            multiple
            onSearchChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            value={dependencyArray.length ? dependencyArray : []}
            selection
            onChange={(e, { value }) => {
                setDependencyArray(value)
            }}
            // icon={false}
            clearable={true}
            noResultsMessage={null}
            options={stateOptions}
        />
    </>
}

export default SearchAddwithoutOptionDropdown