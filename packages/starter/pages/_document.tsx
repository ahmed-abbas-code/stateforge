import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class AppDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Example: self-hosted variable font */}
          <link
            rel="preload"
            href="/fonts/Inter-VariableFont.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          {/* Meta tags */}
          <meta name="theme-color" content="#ffffff" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default AppDocument;
