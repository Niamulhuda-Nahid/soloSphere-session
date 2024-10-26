import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Slide from './Slide';
import bgImg1 from '../assets/images/carousel1.jpg';
import bgImg2 from '../assets/images/carousel2.jpg';
import bgImg3 from '../assets/images/carousel3.jpg';

export default function Carousel() {
  return (
    <div className='container px-6 py-4 mx-auto'>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
            <Slide image={bgImg1} text='Get Your Web Development Project Done in minutes' ></Slide>
        </SwiperSlide>
        <SwiperSlide>
            <Slide image={bgImg2} text='Get Your Graphics Design Project Done in minutes'></Slide>
        </SwiperSlide>
        <SwiperSlide>
            <Slide image={bgImg3} text='Start Your Digital Marketing Campaings up n running'></Slide>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}