import {
createContext,
useContext,
useState,
useEffect,
} from 'react';

import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
const context = useContext(AuthContext);

if (!context) {
throw new Error(
'useAuth must be used within an AuthProvider'
);
}

return context;
};

export const AuthProvider = ({ children }) => {

const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);

// Restore authentication after page refresh
useEffect(() => {

const storedToken =
  localStorage.getItem('token');

const storedUser =
  localStorage.getItem('user');


if (storedToken && storedUser) {

  try {

    setToken(storedToken);

    setUser(
      JSON.parse(storedUser)
    );

  } catch {

    // Remove corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

  }

}

setLoading(false);

}, []);

/**

LOGIN
Step 1:
Check email and password.
Backend sends OTP.
No JWT is stored yet.
*/
const login = async (
email,
password
) => {
const response =
  await api.post(
    '/auth/login',
    {
      email,
      password,
    }
  );

// Response contains:
// { message, email, requiresVerification }

return response.data;

};

/**

REGISTER
Step 1:
Create account.
Backend sends OTP.
No JWT is stored yet.
*/
const register = async (
username,
email,
password
) => {
const response =
  await api.post(
    '/auth/register',
    {
      username,
      email,
      password,
    }
  );

// Response contains:
// { message, email, requiresVerification }

return response.data;

};

/**

VERIFY OTP
Step 2:
Backend verifies OTP.
JWT token is received here.
*/
const verifyCode = async (
email,
code
) => {
const response =
  await api.post(
    '/auth/verify-code',
    {
      email,
      code,
    }
  );


const {
  token: newToken,
  user: userData,
} = response.data;


// Save authentication data
setToken(newToken);

setUser(userData);


localStorage.setItem(
  'token',
  newToken
);


localStorage.setItem(
  'user',
  JSON.stringify(userData)
);


return response.data;

};

/**

RESEND OTP
*/
const resendCode = async (
email
) => {
const response =
  await api.post(
    '/auth/resend-code',
    {
      email,
    }
  );

return response.data;

};

/**

LOGOUT
*/
const logout = () => {
setToken(null);
setUser(null);


localStorage.removeItem(
  'token'
);

localStorage.removeItem(
  'user'
);

};

const value = {

user,

token,

loading,

isAuthenticated: !!token,

isAdmin:
  user?.role === 'admin',


// Authentication functions
login,

register,

verifyCode,

resendCode,

logout,

};

return (

<AuthContext.Provider
  value={value}
>

  {children}

</AuthContext.Provider>

);

};

export default AuthContext;