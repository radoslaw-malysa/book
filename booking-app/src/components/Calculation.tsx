import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "./ui/separator";
import { Calculator } from "lucide-react";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableFooter, TableRow } from "./ui/table";

const Calculation = ({calculation}) => {
  return (<div className="flex flex-col gap-2 py-2 bg-yelllow-100 text-cyan-800">
    <div className="px-4 flex gap-3">
      <div className="w-9 h-9 flex-none flex justify-center items-center">
        <Calculator size="20" />
      </div>
      <div className="flex-grow">
        
        <Table>
          <TableBody>
            {calculation.lesson && <TableRow>
              <TableCell className="py-2 whitespace-normal"><p className="line-clamp-1">{calculation.lesson.name}</p></TableCell>
              <TableCell className="text-right py-2">{calculation.lesson.qty} x {calculation.lesson.price * 1} zł</TableCell>
            </TableRow>}
            {calculation.tour && <TableRow>
              <TableCell className="py-2 whitespace-normal"><p className="line-clamp-1">{calculation.tour.name}</p></TableCell>
              <TableCell className="text-right py-2">{calculation.tour.qty} x {calculation.tour.price * 1} zł</TableCell>
            </TableRow>}
          </TableBody>
          <TableFooter className="bg-transparent">
            <TableRow>
              <TableCell className="py-2">Razem wg cennika</TableCell>
              <TableCell className="text-right py-2">{calculation.total_price}</TableCell>
            </TableRow>
            {calculation.sell_price > 0 && <TableRow>
              <TableCell className="py-2">Cena sprzedaży</TableCell>
              <TableCell className="text-right py-2">{calculation.sell_price}</TableCell>
            </TableRow>}
          </TableFooter>
        </Table>
      </div>
    </div>
  </div>);
  
  /*return (<Alert className="border-cyan-200 bg-cyan-50 text-cyan-900">
    <Calculator />
    <AlertTitle>Kalkulacja ceny</AlertTitle>
    <AlertDescription className="flex flex-col gap-1 text-xs">
      {calculation.lesson && <div>
        <div className="flex justify-between items-start gap-2 mb-1">
          <div><p className="line-clamp-1">{calculation.lesson.name}</p></div>
          <div className="whitespace-nowrap">{calculation.lesson.qty} x {calculation.lesson.price * 1} zł</div>
        </div>
        <Separator />
      </div>}
      
      {calculation.tour && <div>
        <div className="flex justify-between items-start gap-2">
          <div>{calculation.tour.name}</div>
          <div className="whitespace-nowrap">{calculation.tour.qty} x {calculation.lesson.price * 1} zł</div>
        </div>
        <Separator />
      </div>}
    </AlertDescription>
  </Alert>)*/
}

export default Calculation;