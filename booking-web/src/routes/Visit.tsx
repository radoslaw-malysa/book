import Calculation from "@/components/Calculation";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { getBeforeVisit, getCancelBooking, getConfirmBooking, type BookingResponse } from "@/services/booking"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Check, FileText, Printer, Trash, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const token = params.token;

  /*const url = new URL(request.url);
  // Extract and parse search params
  const filters: BookingFilters = {
    service_id: url.searchParams.get("service_id") ?? undefined
  };*/

  const data = await getBeforeVisit(token);

  return data; // { products, total, ... }
}

const Visit = () => {
  let navigate = useNavigate();
  const { token } = useLoaderData() as BookingResponse;
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = async () => {
    const response = await getConfirmBooking(token);

    if ("token" in response && response.token !== undefined) {
      navigate(`/rezerwacja/przed-wizyta/${response.token}`);
    } else if ("message" in response && response.message !== undefined) {
      toast.add({
        type: "error",
        description: response.message,
      })
    } else {
      toast.add({
        type: "error",
        description: 'Operacja nie powiodła się. Spróbuj ponownie.',
      })
    }
  }

  const handleCancel = async () => {
    const response = await getCancelBooking(token);

    if ("token" in response && response.token !== undefined) {
      navigate(`/rezerwacja/przed-wizyta/${response.token}`);
    } else if ("message" in response && response.message !== undefined) {
      toast.add({
        type: "error",
        description: response.message,
      })
    } else {
      toast.add({
        type: "error",
        description: 'Operacja nie powiodła się. Spróbuj ponownie.',
      })
    }
  }
  

  const nextHandler = () => {
    navigate("/rezerwacja/dane");
  }

  return (<section>
    <div className="w-9/10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="flex flex-col gap-12">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Rezerwacja przebiegła pomyślnie</CardTitle>
            <CardDescription>Dziękujemy. Otrzymaliśmy Twoje zgłoszenie. <br />Postępuj dalej zgodnie z poniższymi wskazówkami.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Rezerwacja anulowana</CardTitle>
            <CardDescription>Rezerwacja została anulowana.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="shadow-none bg-muted">
          <CardHeader>
            <CardTitle>Zgłoszenie szkoły do Programu "Kulturalna Szkoła na Mazowszu"</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-left leading-[1.5] text-base">
              <li>Wydrukuj zgłoszenie.</li>
              <li>Najpóźniej <strong>7 dni</strong> przed planowaną wizytą prześlij skan zgłoszenia z pieczątką szkoły i podpisem dyrektora (lub wicedyr.) na adres edukacja@mcswelektrownia.pl. Oryginał wniosku przekaż w kasie w dniu wizyty.</li>
              <li>Bez dostarczonego w terminie wniosku, obowiązują <strong>ceny regularne</strong>.</li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <a href="https://www.mcswelektrownia.pl/pl/kulturalna-szkola-na-mazowszu/14451" target="_blank" className={buttonVariants({ variant: "link", size: "lg" })}><FileText data-icon="inline-start" /> Zasady uczestnictwa w programie</a>
            <Button className="w-full" size="lg"><Printer data-icon="inline-start" /> Drukuj zgłoszenie</Button>
          </CardFooter>
        </Card>

        <Card className="shadow-none bg-muted">
          <CardHeader>
            <CardTitle>Potwierdź rezerwację</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-left leading-[1.5] text-base">
              <li>Prosimy o <strong>odebranie poczty e-mail</strong> i potwierdzenie rezerwacji najpóźniej 5 dni przed terminem zajęć.</li>
              <li>W szczególnych przypadkach (np. znacząca zmiana liczby osób) rezerwacja może być potwierdzona telefonicznie pod numerem <strong className="text-nowrap">tel. 884 320 030</strong>.</li>
              <li>W przypadku braku potwierdzenia lekcja uznana zostaje za odwołaną.</li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col xl:flex-row gap-2 justify-between">
            <Button variant="destructive" size="lg" className="w-full xl:w-auto" onClick={() => setCancelOpen(true)}><Trash  data-icon="inline-start" /> Anuluj rezerwację</Button>
            <div className="px-2">lub</div>
            <Button size="lg" className="w-full xl:w-auto" onClick={() => setConfirmOpen(true)}><Check data-icon="inline-start" /> Potwierdź rezerwację</Button>
          </CardFooter>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Płatność</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-left leading-[1.5] text-base">
              <li>Płatności mogą Państwo dokonać w kasie "Elektrowni" przed rozpoczęciem zajęć.</li>
            </ul>
          </CardContent>
        </Card>

      </div>
      <div>
        <Calculation nextHandler={nextHandler} />
      </div>
    </div>

    <AlertDialog open={cancelOpen}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Anulować rezerwację?</AlertDialogTitle>
          <AlertDialogDescription>
            Na pewno chcesz zrezygnować i zwolnić zarezerwowny termin?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" onClick={() => setCancelOpen(false)}>Zamknij</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleCancel}>Anuluj rezerwację</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={confirmOpen}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Check />
          </AlertDialogMedia>
          <AlertDialogTitle>Potwierdzić rezerwację?</AlertDialogTitle>
          <AlertDialogDescription>
            Na pewno chcesz potwierdzić rezerwację?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Zamknij</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Potwierdź rezerwację</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>)
}

export default Visit