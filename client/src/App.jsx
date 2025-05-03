import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Faktury from "./pages/Faktury";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  { path: "ponuka", element: <Products /> },
  { path: "faktury", element: <Faktury /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
