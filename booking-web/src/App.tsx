import { RouterProvider } from "react-router"
import { router } from "./routes"
import { BookingProvider } from "./context/BookingContext"

const  App = () => {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
    </BookingProvider>
  )
}

export default App
