import React from 'react';
import '../App.css';
import LogoDark from '../assets/LogoDark.png';
import ChainSwitcher from './ChainSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';

const Header = () => {

  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header>

      <div className='col-md-3'>
        <a className="logo" href="/">
          <img src={LogoDark} alt="Logo" />
        </a>
      </div>

      <ChainSwitcher />
     

      <div className="col-md-3">
        <a className="advancedbtn" href={pathname !== '/advanced' ? '/advanced' : '/'}>
          {pathname !== '/advanced' ? 'Advanced' : 'Bot'}
        </a>
		 <a className="advancedbtn logout" onClick={() => { navigate('/logout'); toggleDrawer(); }}>
          Logout
        </a>
      </div>
      
    
    </header>
  );
};

export default Header;