import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Calendar1, CalendarDays, ChevronDownIcon, Plus, SearchIcon, XIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import '@/features/appointments/calendar.css';

const AppointmentsCalendar = () => {

  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return <div className="flex gap-6 h-full">
    <div>
      <div className="flex flex-col gap-4">
        <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" className="bg-muted p-0" />
        <Collapsible open={true}>
          <CollapsibleTrigger render={<Button variant="ghost" className="w-full">Sale<ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" /></Button>} />
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0">
            <FieldSet className="w-full pt-2">
              <FieldGroup className="gap-3">
                <Field orientation="horizontal">
                  <Checkbox name="ch1" id="ch1" defaultChecked />
                  <FieldLabel htmlFor="ch1" className="font-normal">Sala edukacyjna</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox name="ch2" id="ch2" defaultChecked />
                  <FieldLabel htmlFor="ch2" className="font-normal">Sala wystawowa A</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox name="ch3" id="ch3" defaultChecked />
                  <FieldLabel htmlFor="ch3" className="font-normal">Kino</FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
    <Card className="w-full h-full shadow-none ring-0">
      <CardHeader>
        <CardTitle>
          <ButtonGroup>
            <Button className="cursor-pointer"><CalendarDays />Tydziań</Button>
            <Button className="cursor-pointer" variant="secondary"><Calendar1 />Dzień</Button>
          </ButtonGroup>
        </CardTitle>
        <CardAction>
          <div className="flex gap-2 items-center">
            <InputGroup>
              <InputGroupInput placeholder="Szukaj..." className="focus:min-w-sm " />
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Wyczyść" title="Wyczyść" size="icon-xs">
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <Button><Plus /> Utwórz rezerwację</Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Outlet />
      </CardContent>
    </Card>
  </div>
}

export default AppointmentsCalendar;