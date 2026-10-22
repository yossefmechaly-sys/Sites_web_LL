import React from 'react'

type P = { size?: number }

export const MailIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 6 10 7 10-7" />
  </svg>
)

export const FacebookIcon = ({ size = 15 }: P) => (
  <svg width={size} height={size} viewBox="0 0 320 512" fill="currentColor" aria-hidden>
    <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1H297V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z" />
  </svg>
)

export const InstagramIcon = ({ size = 15 }: P) => (
  <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor" aria-hidden>
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
  </svg>
)

export const CartIcon = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 576 512" fill="currentColor" aria-hidden>
    <path d="M528.1 301.3l47.3-208C578.8 78.3 567.4 64 552 64H159.2l-9.2-44.8C147.8 8 137.9 0 126.5 0H24C10.7 0 0 10.7 0 24v16c0 13.3 10.7 24 24 24h69.9l70.2 343.4C147.3 417.1 136 435.2 136 456c0 30.9 25.1 56 56 56s56-25.1 56-56c0-15.7-6.4-29.8-16.8-40h209.6C430.4 426.2 424 440.3 424 456c0 30.9 25.1 56 56 56s56-25.1 56-56c0-22.2-12.9-41.3-31.6-50.4l5.5-24.3c3.4-15-8-29.3-23.4-29.3H218.1l-6.5-32h293.1c11.2 0 20.9-7.8 23.4-18.7z" />
  </svg>
)

export const ChevronDown = ({ size = 10 }: P) => (
  <svg width={size} height={size} viewBox="0 0 10 6" fill="currentColor" aria-hidden>
    <path d="M0 0h10L5 6z" />
  </svg>
)

// Drapeaux du sélecteur de langue (les émojis drapeaux ne s'affichent pas sous Windows)
export const FlagFr = () => (
  <svg width="16" height="12" viewBox="0 0 3 2" aria-hidden>
    <rect width="1" height="2" fill="#002395" />
    <rect x="1" width="1" height="2" fill="#fff" />
    <rect x="2" width="1" height="2" fill="#ED2939" />
  </svg>
)

export const FlagGb = () => (
  <svg width="16" height="12" viewBox="0 0 60 30" aria-hidden>
    <clipPath id="gb-t">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
    </clipPath>
    <path d="M0 0v30h60V0z" fill="#012169" />
    <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
    <path d="M0 0l60 30m0-30L0 30" clipPath="url(#gb-t)" stroke="#C8102E" strokeWidth="4" />
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
    <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
)

export const FlagIl = () => (
  <svg width="16" height="12" viewBox="0 0 220 160" aria-hidden>
    <rect width="220" height="160" fill="#fff" />
    <rect y="15" width="220" height="25" fill="#0038b8" />
    <rect y="120" width="220" height="25" fill="#0038b8" />
    <path d="M110 52l26 45h-52zM110 108l-26-45h52z" fill="none" stroke="#0038b8" strokeWidth="6" />
  </svg>
)
