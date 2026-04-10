// src/data/products.js
import chococookieImage from '../assets/product_choco.jpg';
import applejamcookieImage from '../assets/product_jammy.png';
import potatoImage from '../assets/product_potato.jpg';
import frenchpieImage from '../assets/product_pie.png';
import crownriceImage from '../assets/product_chapssal.png';
import butterwaffleImage from '../assets/product_waffle.jpg';
import bebetoImage from '../assets/product_bebeto.jpg';
import mygummyImage from '../assets/product_mygummy.jpg';
import custardImage from '../assets/product_custard.png';
import binchImage from '../assets/product_binch.jpg'

const products = [
  {
    id: 0,
    name: '뉴드림 초코 쿠키',
    price: 300,
    count: 1,
    imageUrl: chococookieImage
  },
  {
    id: 1,
    name: '잼있는 미니사과쿠키',
    price: 660,
    count: 1,
    imageUrl: applejamcookieImage
  },
  {
    id: 2,
    name: '포테이토 크리스프 스낵 바베큐맛',
    price: 200,
    count: 1,
    imageUrl: potatoImage
  },
  {
    id: 3,
    name: '해태 후렌치파이 딸기',
    price: 450,
    count: 1,
    imageUrl: frenchpieImage
  },
  {
    id: 4,
    name: '크라운 참쌀선과',
    price: 500,
    count: 1,
    imageUrl: crownriceImage
  },
  {
    id: 5,
    name: '리치 에그 버터 와플',
    price: 400,
    count: 1,
    imageUrl: butterwaffleImage
  },
  {
    id: 6,
    name: '베베토 미니 베어 젤리',
    price: 300,
    count: 1,
    imageUrl: bebetoImage
  },
  {
    id: 7,
    name: '오리온 더탱글 마이구미',
    price: 450,
    count: 1,
    imageUrl: mygummyImage
  },
  {
    id: 8,
    name: '청우 커스터드바 ',
    price: 300,
    count: 1,
    imageUrl: custardImage
  },
  {
    id: 9,
    name: '롯데 빈츠 ',
    price: 500,
    count: 1,
    imageUrl: binchImage
  }
];

export default products;
