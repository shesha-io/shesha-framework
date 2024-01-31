import React from 'react';
import NProgress from 'nprogress';
import Router from 'next/router';

export const CustomNProgress = () => {
  const startProgress = () => NProgress.start();
  const stopProgress = (timer: NodeJS.Timeout) => {
    clearTimeout(timer);
    NProgress.done();
  };

  const showProgressBar = (delay: any) => {
    const timer = setTimeout(startProgress, delay);
    Router.events.on('routeChangeComplete', () => stopProgress(timer));
    Router.events.on('routeChangeError', () => stopProgress(timer));
  };

  Router.events.on('routeChangeStart', () => showProgressBar(10));
  return <React.Fragment />;
};

export default CustomNProgress;
