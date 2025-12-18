import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata = {
    title: "Pure Sakura Healing | Japanese Wellness Spa in Makati",
    description: "Experience authentic Japanese OMOTENASHI service at Pure Sakura Healing Japanese Wellness Spa. Swedish, Shiatsu, Hot Stone massages and more. Book your relaxing session today!",
    keywords: "japanese spa, wellness spa, massage makati, shiatsu massage, swedish massage, hot stone therapy, spa philippines, pure sakura healing",
    authors: [{ name: "Pure Sakura Healing" }],
    creator: "Pure Sakura Healing",
    metadataBase: new URL("https://puresakurahealing.com"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Pure Sakura Healing | Japanese Wellness Spa",
        description: "Experience authentic Japanese OMOTENASHI service. Book your relaxing massage session today!",
        url: "https://puresakurahealing.com",
        siteName: "Pure Sakura Healing",
        locale: "en_PH",
        type: "website",
        images: [
            {
                url: "/images/logo.png",
                width: 512,
                height: 512,
                alt: "Pure Sakura Healing Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pure Sakura Healing | Japanese Wellness Spa",
        description: "Experience authentic Japanese OMOTENASHI service. Book your relaxing massage session today!",
        images: ["/images/logo.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
