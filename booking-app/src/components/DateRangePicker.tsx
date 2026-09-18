"use client"

import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangeProps {
  range: any;
  setRange: () => void;
}

export function DateRangePicker({range, setRange}: DateRangeProps) {
  const clearHandler = (e) => {
    e.stopPropagation();
    setRange({from: undefined, to: undefined})
  }

  return (
    <Field className="mx-auto w-60">
      <Popover>
        <PopoverTrigger render={<div className="relative"><Button variant="secondary" id="date-picker-range" className="justify-start pl-2.5 pr-10 font-normal bg-input/50"><CalendarIcon color="gray" data-icon="inline-start" />{range?.from ? (
            range.to ? (
              <>
                {format(range.from, "dd.MM.y")} -{" "}
                {format(range.to, "dd.MM.y")}
              </>
            ) : (
              format(range.from, "dd.MM.y")
            )
          ) : (
            <span className="text-muted-foreground">Data wizyty</span>
          )}</Button>{range?.from && <Button variant="ghost" className="rounded-full absolute right-0 top-0" onClick={clearHandler}><X color="gray" /></Button>}</div>} />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

export default DateRangePicker