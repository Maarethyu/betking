import Login from 'pages/Login';
import Register from 'pages/Register';
import Index from 'pages/Index';
import Settings from 'pages/Settings';
import Sessions from 'pages/Sessions';
import Set2fa from 'pages/Set2fa';
import Stats from 'pages/Stats';

import PageNotFound from 'pages/PageNotFound';

import Menu from 'components/Menu';
import AppShell from 'components/AppShell';

import * as hooks from './router-hooks';

const routes = [
  /* Pages which need user session to be fetched */
  {
    path: '/',
    components: {
      default: AppShell,
      menu: Menu
    },
    meta: {requiresUser: true},
    children: [
      /* Pages which render for both user logged in or logged out state */
      {path: '', component: Index},

      /* Pages which need user to be logged out */
      {path: '/login', component: Login, meta: {requiresLoggedOut: true}},
      {path: '/register', component: Register, meta: {requiresLoggedOut: true}},

      /* Pages which need user authentication */
      {path: 'settings', component: Settings, meta: {requiresAuth: true}},
      {path: 'sessions', component: Sessions, meta: {requiresAuth: true}},
      {path: 'two-factor', component: SetTwoFactorAuth, meta: {requiresAuth: true}}
    ]
  },
  /* Pages which do not need user session to be fetched */
  {path: '/stats', component: Stats},

  /* Dummy logout route so that GET /logout also works */
  {path: '/logout', beforeEnter: hooks.logout},

  /* Shows PageNotFound component in dev mode, redirects to /404 route in prod */
  {path: '*', component: PageNotFound}
];

export default routes;
