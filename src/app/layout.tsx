import type { Metadata } from 'next';
import './globals.css';
import './calendar.css';
export const metadata:Metadata={title:'Branch appointment booking',description:'Choose a branch and a convenient time for your appointment.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
