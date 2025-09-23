import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { ProductViewPage } from '../pages/ProductViewPage';
import { ProductEditPage } from '../pages/ProductEditPage';
import { Layout } from '../components/layout/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/product/:id',
        element: <ProductViewPage />,
      },
      {
        path: '/product/:id/edit',
        element: <ProductEditPage />,
      },
      {
        path: '/product/new',
        element: <ProductEditPage isNew={true} />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
