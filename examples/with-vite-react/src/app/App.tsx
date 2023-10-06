import 'didit-sdk/styles.css';
import '../styles/App.css';
import Providers from './Providers';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthStatus from './routes/AuthStatus.tsx';
import Home from './routes/Home.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/status',
    element: <AuthStatus />,
  },
]);

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
