
interface StepsProps {
  step: number
}

const Steps = ({step}: StepsProps) => {
  return (<section className="flex-none h-14 lg:h-22 flex items-center justify-center sticky top-0 z-2">
    <ul className="flex gap-8 text-base font-medium">
      <li>Rezerwacja</li>
      <li>Twoje dane</li>
      <li>Przed wizytą</li>
    </ul>
  </section>)
}

export default Steps