import '../styles/tailwind.css';
import { AppProps } from "next/app";
import Axios from 'axios';

import NavBar from '../compoents/NavBar';
import { Fragment } from 'react';

import { useRouter } from 'next/router';
Axios.defaults.baseURL = 'http://localhost:5000/api'; //默认URL
Axios.defaults.withCredentials = true;
//  { withCredentials: true });
// 允许传递cookie， 信任server

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ['/register', '/login'];
  const authRoute = authRoutes.includes(pathname);
  return (
    <Fragment>
      {!authRoute && <NavBar />}
      <Component {...pageProps} />
    </Fragment>
  )
}

export default App;