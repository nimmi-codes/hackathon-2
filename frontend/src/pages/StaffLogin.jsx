import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminLogin, getToken, setToken } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import { Hero } from '../components/ui.jsx';

export default function StaffLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await adminLogin(password);
      setToken(token);
      toast('Welcome back');
      navigate('/admin');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Hero chip="Staff portal" before="Staff" accent="sign in" />
      <form className="form glass pad narrow" onSubmit={onSubmit}>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  );
}
