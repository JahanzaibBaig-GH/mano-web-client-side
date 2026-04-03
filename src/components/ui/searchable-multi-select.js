'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Checkbox } from './checkbox';

/**
 * Searchable multi-select dropdown (shadcn-style).
 * - Dynamic options via props
 * - Loading and empty states
 * - Controlled: value (array) + onChange
 * - Efficient filter inside dropdown (cmdk)
 *
 * @param {Object} props
 * @param {Array} props.options - List of options (e.g. [{ name: 'x' }] or [{ value, label }])
 * @param {string[]} props.value - Selected values (array of ids/values)
 * @param {function} props.onChange - (values: string[]) => void
 * @param {function} [props.getOptionValue] - (option) => value, default: o => o.name ?? o.value
 * @param {function} [props.getOptionLabel] - (option) => label, default: o => o.name ?? o.label ?? o
 * @param {string} [props.placeholder] - Trigger placeholder
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage] - When no options or no search results
 * @param {string} [props.searchPlaceholder] - Search input placeholder
 * @param {string} [props.className]
 * @param {string} [props.error]
 * @param {function} [props.renderOption] - (option) => ReactNode for custom row
 */
export function SearchableMultiSelect({
  options = [],
  value = [],
  onChange,
  getOptionValue = (o) => o.name ?? o.value,
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
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const toggle = (optValue) => {
    const next = selectedSet.has(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(next);
  };

  const firstSelected = value.length > 0 ? options.find((o) => getOptionValue(o) === value[0]) : null;
  const displayLabel =
    value.length === 0
      ? placeholder
      : value.length === 1 && firstSelected
      ? getOptionLabel(firstSelected)
      : `${value.length} selected`;

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
            value.length === 0 && 'text-gray-400',
            error && 'border-red-400 bg-red-50',
            className
          )}
        >
          {displayLabel}
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
                const checked = selectedSet.has(optValue);
                return (
                  <CommandItem
                    key={optValue}
                    value={getOptionLabel(option)}
                    onSelect={() => toggle(optValue)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox checked={checked} />
                      {renderOption ? renderOption(option) : getOptionLabel(option)}
                    </div>
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

export default SearchableMultiSelect;
