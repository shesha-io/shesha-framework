"use client";

import Banner from 'src/components/Banner';
import Card from 'src/components/NavCard';
import React from 'react';
import { MainLayout, PageWithLayout } from '@shesha-io/reactjs';

const Home: PageWithLayout<{}> = () => {
  return (
    <MainLayout noPadding>
      <div
        style={{
          padding: "15px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: "30px",
        }}
      >
        <Banner
          url="https://www.youtube.com/embed/VYN6GBCEPGw?autoplay=1&controls=0"
          image={"/images/get-to-know-shesha-banner.png"}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridColumnGap: "20px",
          }}
        >
          <Card
            title="Build your first app"
            url={"https://docs.shesha.io/docs/get-started/tutorial/the-basics/"}
            description="A quickstart guide to help you build an app using Shesha"
          />
          <Card
            title="Documentation"
            url={"https://docs.shesha.io/docs/get-started/Introduction"}
            description="A deeper dive into core Shesha functionality"
          />
          <Card
            title="How to change landing page"
            url={
              "https://docs.shesha.io/docs/fundamentals/how-to-change-home-page/"
            }
            description="Change your landing page to a custom page"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
