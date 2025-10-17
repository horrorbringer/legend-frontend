"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingsFiltersProps {
  onFilter: (filters: BookingsFilterValues) => void;
}

export interface BookingsFilterValues {
  search?: string;
  status?: 'pending' | 'paid' | 'cancelled';
  start_date?: string;
  end_date?: string;
  payment_method?: 'khqr' | 'aba';
}

export function BookingsFilters({ onFilter }: BookingsFiltersProps) {
  const [filters, setFilters] = useState<BookingsFilterValues>({});
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const handleFilter = (newFilters: Partial<BookingsFilterValues>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    handleFilter({
      start_date: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      end_date: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
    });
  };

  const clearFilters = () => {
    setFilters({});
    setDateRange({});
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search bookings..."
              value={filters.search ?? ''}
              onChange={(e) => handleFilter({ search: e.target.value || undefined })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value: any) => handleFilter({ status: value || undefined })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Payment Method Filter */}
        <Select
          value={filters.payment_method}
          onValueChange={(value: any) => handleFilter({ payment_method: value || undefined })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="khqr">KHQR</SelectItem>
              <SelectItem value="aba">ABA</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}