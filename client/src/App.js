import logo from './logo.svg';
import './App.css';
import Login from './components/login';
import Dashboard from './components/dashboard';

import React, { useState, useEffect } from "react";
import {
  Routes,
  Route
} from 'react-router-dom';
import Register from './components/register';
import {useNavigate} from  "react-router-dom";


function App() {
  const [token, setToken] = useState("");
  useEffect(() => {
        init();
  }, []);
  const navigate = useNavigate();
  const init = () => {
    const token = sessionStorage.getItem("SERVER_API_TOKEN");
    console.log("TOKEN:", token);
    if (token)
    {
      setToken(token);
    } else {
      setToken("");
    }
  }
  const logout = () => {

    console.log("App.logout");
    sessionStorage.removeItem("SERVER_API_TOKEN");
    setToken("");

  }
  const setTokenNext =(token, next)=>
  {
    console.log("setTokenNext:", token);
    sessionStorage.setItem("SERVER_API_TOKEN", token);
    setToken(token);
    if (next)
    {
        navigate(next);
    }
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to my donation site</h1>
        <img src={logo} className="App-logo" alt="logo" />
        
        <Routes>
          <Route path="/" element={
            token ?
              <Dashboard token={token} setToken={logout}/>
              : <Login setToken={setToken} />} />
          <Route path="/reg" element={<Register setToken={setTokenNext} />} />
          <Route path="/home" element={
            token ?
              <Dashboard token={token} setToken={logout}/>
              : <Login setToken={setToken} />} />
          <Route path="/signout" element={<Login setToken={setTokenNext} />}/>
      
        </Routes>
      </header>
    </div>
  );
}

export default App;
