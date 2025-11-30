import React, { useState, useEffect } from 'react';
import { DayPicker } from "react-day-picker";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onRangeChange?: (range: { startDate?: string; endDate?: string }) => void;
  onPresetChange?: (preset: string) => void;
  selectedPreset?: string;
}

type PresetType = 'all' | '24h' | '7d' | '30d' | '90d' | 'custom';

export function DateRangePicker({ 
  onDateRangeChange, 
  onRangeChange, 
  onPresetChange,
  selectedPreset = '7d'
}: DateRangePickerProps) {
  const now = new Date();
  const [preset, setPreset] = useState<PresetType>((selectedPreset as PresetType) || '7d');
  const [startDate, setStartDate] = useState<Date>(subDays(now, 7));
  const [endDate, setEndDate] = useState<Date>(now);
  const [isOpen, setIsOpen] = useState(false);
  const [selectingRange, setSelectingRange] = useState<'start' | 'end'>('start');

  // Update dates when preset changes
  useEffect(() => {
    let newStart = startDate;
    let newEnd = endDate;

    switch (preset) {
      case 'all':
        newStart = subDays(now, 365);
        newEnd = now;
        break;
      case '24h':
        newStart = subDays(now, 1);
        newEnd = now;
        break;
      case '7d':
        newStart = subDays(now, 7);
        newEnd = now;
        break;
      case '30d':
        newStart = subDays(now, 30);
        newEnd = now;
        break;
      case '90d':
        newStart = subDays(now, 90);
        newEnd = now;
        break;
      case 'custom':
        // Keep current dates
        return;
    }

    setStartDate(startOfDay(newStart));
    setEndDate(endOfDay(newEnd));
    
    // Call both callbacks for compatibility
    onDateRangeChange?.(startOfDay(newStart), endOfDay(newEnd));
    onRangeChange?.({
      startDate: startOfDay(newStart).toISOString(),
      endDate: endOfDay(newEnd).toISOString(),
    });
    onPresetChange?.(preset);
  }, [preset]);

  const handleDayClick = (day: Date) => {
    if (selectingRange === 'start') {
      setStartDate(startOfDay(day));
      setSelectingRange('end');
    } else {
      const newEnd = endOfDay(day);
      if (newEnd >= startDate) {
        setEndDate(newEnd);
        setSelectingRange('start');
        setPreset('custom');
        
        // Call both callbacks for compatibility
        onDateRangeChange?.(startDate, newEnd);
        onRangeChange?.({
          startDate: startDate.toISOString(),
          endDate: newEnd.toISOString(),
        });
        onPresetChange?.('custom');
        setIsOpen(false);
      }
    }
  };

  const handleClear = () => {
    setPreset('7d');
    setSelectingRange('start');
  };

  const getPresetLabel = (): string => {
    switch (preset) {
      case 'all':
        return 'Всё время';
      case '24h':
        return 'Последние 24 часа';
      case '7d':
        return 'Последние 7 дней';
      case '30d':
        return 'Последние 30 дней';
      case '90d':
        return 'Последние 90 дней';
      case 'custom':
        return `${format(startDate, 'dd.MM.yyyy', { locale: ru })} - ${format(endDate, 'dd.MM.yyyy', { locale: ru })}`;
      default:
        return 'Выбрать период';
    }
  };

  const isCustomRange = preset === 'custom';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Preset buttons */}
      <Button
        variant={preset === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPreset('all')}
        className="text-xs"
      >
        Всё время
      </Button>
      <Button
        variant={preset === '24h' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPreset('24h')}
        className="text-xs"
      >
        24ч
      </Button>
      <Button
        variant={preset === '7d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPreset('7d')}
        className="text-xs"
      >
        7д
      </Button>
      <Button
        variant={preset === '30d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPreset('30d')}
        className="text-xs"
      >
        30д
      </Button>
      <Button
        variant={preset === '90d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setPreset('90d')}
        className="text-xs"
      >
        90д
      </Button>

      {/* Custom date picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustomRange ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1"
          >
            <Calendar className="w-3 h-3" />
            <span className="hidden sm:inline">Период</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 bg-slate-900 border-slate-700" align="start">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Выберите период</h3>
              <div className="grid grid-cols-2 gap-2">
                <DayPicker
                  mode="default"
                  selected={selectingRange === 'start' ? startDate : endDate}
                  onDayClick={handleDayClick}
                  disabled={(date) => date > now}
                  locale={ru}
                  classNames={{
                    months: "flex gap-4",
                    month: "space-y-2",
                    caption: "text-xs font-semibold text-slate-200 text-center",
                    head_row: "grid grid-cols-7 gap-1",
                    head_cell: "text-xs text-slate-400 font-normal w-8 h-8 flex items-center justify-center",
                    row: "grid grid-cols-7 gap-1",
                    cell: "w-8 h-8 text-xs",
                    day: "w-8 h-8 p-0 font-normal text-slate-300 hover:bg-slate-700 rounded",
                    day_selected:
                      selectingRange === 'start'
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-600 text-white',
                    day_today: "bg-slate-700 text-slate-100 font-semibold",
                    day_outside: "text-slate-500",
                    day_disabled: "text-slate-500 opacity-50",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs text-slate-400">
              <div>
                <span className="font-semibold">От:</span>{' '}
                {format(startDate, 'dd.MM.yyyy', { locale: ru })}
              </div>
              <div>
                <span className="font-semibold">До:</span>{' '}
                {format(endDate, 'dd.MM.yyyy', { locale: ru })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setPreset('custom');
                  setIsOpen(false);
                }}
                className="flex-1 text-xs"
              >
                Применить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Отмена
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear button */}
      {isCustomRange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-xs gap-1 text-slate-400 hover:text-slate-200"
        >
          <X className="w-3 h-3" />
          <span className="hidden sm:inline">Сброс</span>
        </Button>
      )}

      {/* Display current range */}
      <div className="hidden lg:flex items-center text-xs text-slate-400 ml-auto">
        <Calendar className="w-3 h-3 mr-1" />
        {getPresetLabel()}
      </div>
    </div>
  );
}
