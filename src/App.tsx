import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { appRoutes } from "./config/routes";
// import AuthLayout from '@/layouts/AuthLayout';
// import MainLayout from '@/layouts/MainLayout';
import ManagerLayout from "./components/layouts/labmanager/ManagerLayout";

const isLoggedIn = () => Boolean(localStorage.getItem("token"));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {appRoutes.map((route) => {
          const Page = route.element;

          const pageEl = route.isPrivate ? (
            isLoggedIn() ? (
              <Page />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Page />
          );

          // ✅ chỉ bọc layout khi là labmanager
          const element =
            route.layout === "labmanager" ? (
              <ManagerLayout>{pageEl}</ManagerLayout>
            ) : (
              pageEl
            ); // auth: render thẳng

          return <Route key={route.path} path={route.path} element={element} />;
        })}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
