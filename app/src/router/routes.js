import AppShell from 'components/AppShell/AppShell';

const routes = [
  /* Pages which need user session to be fetched */
  {
    path: '/',
    components: {
      default: AppShell,
      // menu: Menu
    },
    meta: {requiresUser: true},
    children: [
      /* Pages which render for both user logged in or logged out state */
      {path: '', component: () => import('pages/Home/Home')},

      /* Pages which need user to be logged out */
      {path: '/login', component: () => import('pages/Login'), meta: {requiresLoggedOut: true}},
      {path: '/forgot-password', component: () => import('pages/ForgotPassword'), meta: {requiresLoggedOut: true}},
      {path: '/register', component: () => import('pages/Register'), meta: {requiresLoggedOut: true}},

      /* Pages which need user authentication */
      {path: 'settings', component: () => import('pages/Settings'), meta: {requiresAuth: true}},
      {path: 'sessions', component: () => import('pages/Sessions'), meta: {requiresAuth: true}},
      {path: 'two-factor', component: () => import('pages/Set2fa'), meta: {requiresAuth: true}},
      {path: 'whitelisted-ips', component: () => import('pages/WhitelistedIps'), meta: {requiresAuth: true}},
      {path: 'login-attempts', component: () => import('pages/LoginAttempts'), meta: {requiresAuth: true}},
      {path: 'wallet', component: () => import('pages/UserWallet'), meta: {requiresAuth: true}}
    ]
  },
  /* Pages which do not need user session to be fetched */
  {path: '/reset-password', component: () => import('pages/ResetPassword')},
  {path: '/verify-email', component: () => import('pages/VerifyEmail')},

  /* Shows PageNotFound component in dev mode, redirects to /404 route in prod */
  {path: '*', component: () => import('pages/PageNotFound')}
];

export default routes;
