'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Searchable single-select dropdown (shadcn-style).
 * - Dynamic options via props
 * - Loading and empty states
 * - Controlled: value + onChange
 * - Efficient filter inside dropdown (cmdk)
 *
 * @param {Object} props
 * @param {Array} props.options - List of options (e.g. [{ id, name }] or [{ value, label }])
 * @param {string} props.value - Selected value (id or value)
 * @param {function} props.onChange - (value) => void
 * @param {function} [props.getOptionValue] - (option) => value, default: o => o.id ?? o.value
 * @param {function} [props.getOptionLabel] - (option) => label, default: o => o.name ?? o.label ?? o
 * @param {string} [props.placeholder] - Trigger placeholder
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading] - Show loading state in trigger/dropdown
 * @param {string} [props.emptyMessage] - When no options or no search results
 * @param {string} [props.searchPlaceholder] - Search input placeholder
 * @param {string} [props.className]
 * @param {string} [props.error] - Show error state (border)
 * @param {function} [props.renderOption] - (option) => ReactNode for custom row
 */
export function SearchableSelect({
  options = [],
  value,
  onChange,
  getOptionValue = (o) => o.id ?? o.value,
  getOptionLabel = (o) => o.name ?? o.label ?? String(o),
  placeholder = 'Select…',
  disabled = false,
  loading = false,
  emptyMessage = 'No results found.',
  searchPlaceholder = 'Search…',
  className,
  error = false,
  renderOption,
}) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((o) => getOptionValue(o) === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            'w-full justify-between font-normal h-9 px-3 text-sm',
            !displayLabel && 'text-gray-400',
            error && 'border-red-400 bg-red-50',
            className
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Loading…
            </span>
          ) : (
            displayLabel || placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const optValue = getOptionValue(option);
                const isSelected = value === optValue;
                return (
                  <CommandItem
                    key={optValue}
                    value={getOptionLabel(option)}
                    onSelect={() => {
                      onChange(optValue);
                      setOpen(false);
                    }}
                  >
                    {renderOption ? renderOption(option) : getOptionLabel(option)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchableSelect;
