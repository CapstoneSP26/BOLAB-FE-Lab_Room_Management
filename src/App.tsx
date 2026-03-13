import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { appRoutes } from './config/routes';
//import AuthLayout from "./pages/AuthLayout";
// import MainLayout from '@/layouts/MainLayout';

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {appRoutes.map((route) => {
          // const Layout =
          //   route.layout === 'auth' ? AuthLayout : MainLayout;

          const Page = route.element;
          // layout auth
          if (route.layout === "auth") {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  // <Layout>
                  <Page />
                  // </Layout>
                }
              />
            );
          }
        })}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
// import { Routes, Route, Navigate } from "react-router-dom";
// import { Suspense } from "react";
// import { appRoutes } from "./config/routes";
// import ManagerLayout from "./components/layouts/labmanager/ManagerLayout";

// const isLoggedIn = () => Boolean(localStorage.getItem("token"));

// export default function App() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <Routes>
//         {appRoutes.map((route) => {
//           const Page = route.element;

//           const pageEl = route.isPrivate ? (
//             isLoggedIn() ? (
//               <Page />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           ) : (
//             <Page />
//           );

//           const element =
//             route.layout === "labmanager" ? (
//               <ManagerLayout>{pageEl}</ManagerLayout>
//             ) : (
//               pageEl
//             );

//           return <Route key={route.path} path={route.path} element={element} />;
//         })}

//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </Suspense>
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { Suspense } from 'react';
// import { appRoutes } from './config/routes';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import { BuildingProvider } from './context/BuildingContext';
// // import AuthLayout from '@/layouts/AuthLayout';
// // import MainLayout from '@/layouts/MainLayout';

// export default function App() {
//   return (
//     <BuildingProvider>
//       <div className="min-h-screen flex flex-col bg-transparent relative">
//         <Header />
//         <div className="flex-1 flex flex-col">
//           <Suspense fallback={<div>Loading...</div>}>
//             <Routes>
//               {appRoutes.map((route) => {
//                 const Page = route.element;
//                 return (
//                   <Route
//                     key={route.path}
//                     path={route.path}
//                     element={<Page />}
//                   />
//                 );
//               })}
//               {/* Fallback route */}
//               <Route path="*" element={<Navigate to="/" />} />
//             </Routes>
//           </Suspense>
//         </div>
//         <Footer />
//       </div>
//     </BuildingProvider>
//   );
// }
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { appRoutes } from "./config/routes";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ManagerLayout from "./components/layouts/labmanager/ManagerLayout";
import { BuildingProvider } from "./context/BuildingContext";

const isLoggedIn = () => Boolean(localStorage.getItem("token"));

export default function App() {
  return (
    <BuildingProvider>
      <div className="min-h-screen flex flex-col bg-transparent relative">
        <Header />

        <div className="flex-1 flex flex-col">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {appRoutes.map((route) => {
                const Page = route.element;

                // 1) route private -> cần login
                const pageEl = route.isPrivate ? (
                  isLoggedIn() ? (
                    <Page />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                ) : (
                  <Page />
                );

                // 2) chỉ bọc ManagerLayout khi route.layout === "labmanager"
                const element =
                  route.layout === "labmanager" ? (
                    <ManagerLayout>{pageEl}</ManagerLayout>
                  ) : (
                    pageEl
                  );

                return (
                  <Route key={route.path} path={route.path} element={element} />
                );
              })}

              {/* fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </div>
    </BuildingProvider>
  );
}
