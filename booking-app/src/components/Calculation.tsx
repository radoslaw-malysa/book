import { Calculator } from "lucide-react";

import { Table, TableBody, TableCell, TableFooter, TableRow } from "./ui/table";

const Calculation = ({calculation}) => {
  return (<div className="flex flex-col gap-2 py-2 bg-cyan-100 text-cyan-600 mx-2 rounded-2xl border border-cyan-300">
    <div className="px-2 flex gap-3">
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
}

export default Calculation;