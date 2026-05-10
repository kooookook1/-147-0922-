/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import VIP from './pages/VIP';
import Record from './pages/Record';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Support from './pages/Support';

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="vip" element={<VIP />} />
          <Route path="record" element={<Record />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<Support />} />
          <Route path="owner-admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}
