"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  iconColor = "text-blue-600",
}) {
  const [open, setOpen] = React.useState(false);

  // Convert string ISO / YYYY-MM-DD to Date object if needed
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-medium text-xs h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-800 cursor-pointer",
            !value && "text-slate-400 font-normal",
            className
          )}
        >
          <CalendarIcon className={cn("mr-2 h-3.5 w-3.5 shrink-0", iconColor)} />
          {selectedDate && !isNaN(selectedDate.getTime()) ? (
            selectedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[350] rounded-2xl bg-white border-slate-200 shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
