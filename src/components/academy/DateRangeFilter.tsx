import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

type PresetOption = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetOption>('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (value: PresetOption) => {
    setPreset(value);
    const today = new Date();

    switch (value) {
      case 'all':
        onDateRangeChange({ from: undefined, to: undefined });
        break;
      case 'today':
        onDateRangeChange({ from: today, to: today });
        break;
      case 'last7':
        onDateRangeChange({ from: subDays(today, 6), to: today });
        break;
      case 'last30':
        onDateRangeChange({ from: subDays(today, 29), to: today });
        break;
      case 'thisMonth':
        onDateRangeChange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        onDateRangeChange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      case 'custom':
        setIsCalendarOpen(true);
        break;
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange(range);
      if (range.from && range.to) {
        setIsCalendarOpen(false);
      }
    }
  };

  const clearFilter = () => {
    setPreset('all');
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const formatDateRange = () => {
    if (!dateRange.from) return 'Todo o período';
    if (!dateRange.to) return format(dateRange.from, "dd 'de' MMM", { locale: ptBR });
    if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return format(dateRange.from, "dd 'de' MMM", { locale: ptBR });
    }
    return `${format(dateRange.from, 'dd/MM')} - ${format(dateRange.to, 'dd/MM')}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={preset} onValueChange={(value) => handlePresetChange(value as PresetOption)}>
        <SelectTrigger className="w-40 h-9">
          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo o período</SelectItem>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="last7">Últimos 7 dias</SelectItem>
          <SelectItem value="last30">Últimos 30 dias</SelectItem>
          <SelectItem value="thisMonth">Este mês</SelectItem>
          <SelectItem value="lastMonth">Mês passado</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}

      {(dateRange.from || dateRange.to) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            {formatDateRange()}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearFilter}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
