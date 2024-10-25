import { Providers } from './Providers';
import ThemeRegistry from './ThemeRegistry';

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <Providers>
            <ThemeRegistry>{children}</ThemeRegistry>
        </Providers>
        </body>
        </html>
    );
}