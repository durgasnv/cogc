import './globals.css';

export const metadata = {
  title: 'Cook or Get Cooked',
  description: 'Live technical fire round — controller and participant apps.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
