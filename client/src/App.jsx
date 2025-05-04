import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Faktury from "./pages/Faktury";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  { path: "ponuka", element: <Products /> },
  { path: "faktury", element: <Faktury /> },
  { path: "dashboard", element: <DashboardPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
