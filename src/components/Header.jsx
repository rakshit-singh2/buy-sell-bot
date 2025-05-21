import React from 'react';
import '../App.css';
import LogoDark from '../assets/LogoDark.png';
import ChainSwitcher from './ChainSwitcher';
import { useLocation } from 'react-router-dom';

const Header = () => {

  const { pathname } = useLocation();

  return (
    <header>

      <div className='col-md-3'>
        <a className="logo" href="/">
          <img src={LogoDark} alt="Logo" />
        </a>
      </div>

      <ChainSwitcher />

      {pathname != '/advanced-bot' ?
        <div className='col-md-3'>
          <a className='advancedbtn' href="/advanced-bot">
            Advanced Bot
          </a>
        </div>
        :
        <div className='col-md-3'>
          <a className='advancedbtn' href="/bot">
            Bot
          </a>
        </div>
      }
    </header>
  );
};

export default Header;