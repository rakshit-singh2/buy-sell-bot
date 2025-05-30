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
      <Stack direction="row" spacing={2}>

      <div className="col-md-3">
        <a className="advancedbtn" href={pathname !== '/advanced-bot' ? '/advanced-bot' : '/bot'}>
          {pathname !== '/advanced-bot' ? 'Advanced' : 'Bot'}
        </a>
      </div>
      <div className="col-md-3">
        <a className="advancedbtn" onClick={() => { navigate('/logout'); toggleDrawer(); }}>
          Logout
        </a>
      </div>
    </Stack>
    </header>
  );
};

export default Header;