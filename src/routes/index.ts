import { About } from "@/pages/About";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { MdsRecordDetail } from "@/pages/MdsRecordDetail";
import { MdsRecords } from "@/pages/MdsRecords";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/records",
    Component: MdsRecords,
  },
  {
    path: "/records/:workflowId",
    Component: MdsRecordDetail,
  },
]);
