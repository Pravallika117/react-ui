import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_njntFpaNa",
  client_id: "2p067oa8sj2k0u9llme1f05kj3",
  redirect_uri: "https://d1s0dilg6yxd4e.cloudfront.net/",
  response_type: "code",
  scope: "email openid phone",
};

// const root = ReactDOM.createRoot(document.getElementById("root"));

/* // wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
); */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
