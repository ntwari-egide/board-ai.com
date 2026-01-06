/**
 * @author: Egide Ntwali
 * @description: The SEO component, It is used to manage the SEO of the website and the pages
 * @par am {SeoProps} props The props of the SEO component
 * @param {string} date The date of the SEO component
 * @param {string} templateTitle The template title of the SEO component
 * @returns {JSX.Element} The SEO component
 */

import Head from 'next/head';
import { useRouter } from 'next/router';

const defaultMeta = {
  title: 'Board AI | AI-powered Collaborative Brainstorming',
  siteName: 'Board AI',
  description:
    'Board AI is a collaborative AI brainstorming platform with specialized autonomous agents for modern product teams. Stress-test product ideas with Marketing, PM, Developer, and QA personas.',
  /** Without additional '/' on the end, e.g. https://theodorusclarence.com */
  url: 'https://boardai.com',
  type: 'website',
  robots: 'follow, index',
  /**
   * No need to be filled, will be populated with openGraph function
   * If you wish to use a normal image, just specify the path below
   */
  image:
    'https://res.cloudinary.com/dpqasrwfu/image/upload/v1732817531/bdbc9gzv4homuk8xkk1v.png',
};

type SeoProps = {
  date?: string;
  templateTitle?: string;
} & Partial<typeof defaultMeta>;

const FAVICON_VERSION = 'v2';
const withVersion = (href: string) => `${href}?v=${FAVICON_VERSION}`;

export default function Seo(props: SeoProps) {
  const router = useRouter();
  const meta = {
    ...defaultMeta,
    ...props,
  };
  meta['title'] = props.templateTitle
    ? `${props.templateTitle} | ${meta.siteName} - Collaborative AI brainstorming platform`
    : meta.title;

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name='title' content='Board AI | Collaborative AI brainstorming' />
      {/* Description */}
      <meta
        name='description'
        content='Board AI is a collaborative AI brainstorming platform with specialized autonomous agents for modern product teams. Stress-test product ideas with Marketing, PM, Developer, and QA personas.'
      />
      {/* Keywords */}
      <meta
        name='keywords'
        content='Board AI, AI brainstorming, collaborative AI, product teams, autonomous agents, product development, team collaboration, AI personas, marketing AI, PM AI, developer AI, QA AI, product ideation, consensus-driven strategy'
      />
      {/* Author */}
      <meta name='author' content='Egide Ntwari' />
      <meta name='robots' content={meta.robots} />
      <meta content={meta.description} name='description' />
      <meta property='og:url' content={`${meta.url}${router.asPath}`} />
      <link rel='canonical' href={`${meta.url}${router.asPath}`} />
      {/* Open Graph */}
      <meta property='og:type' content={meta.type} />
      <meta property='og:site_name' content={meta.siteName} />
      <meta property='og:description' content={meta.description} />
      <meta property='og:title' content={meta.title} />
      <meta name='image' property='og:image' content={meta.image} />
      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      {/* // !STARTERCONF Remove or change to your handle */}
      {/* <meta name='twitter:site' content='@th_clarence' /> */}
      <meta name='twitter:title' content={meta.title} />
      <meta name='twitter:description' content={meta.description} />
      <meta name='twitter:image' content={meta.image} />
      {meta.date && (
        <>
          <meta property='article:published_time' content={meta.date} />
          <meta
            name='publish_date'
            property='og:publish_date'
            content={meta.date}
          />
          {/* // !STARTERCONF Remove or change to your name */}
          <meta
            name='author'
            property='article:author'
            content='Egide Ntwari'
          />
        </>
      )}

      {/* Favicons */}
      {favicons.map((linkProps) => {
        // Key combines rel and href to avoid duplicate keys when hrefs repeat (e.g. favicon.ico)
        const key = `${linkProps.rel}-${linkProps.href}`;
        return <link key={key} {...linkProps} />;
      })}
      <meta name='msapplication-TileColor' content='#ffffff' />
      <meta
        name='msapplication-config'
        content={withVersion('/favicon/browserconfig.xml')}
      />
      <meta name='theme-color' content='#ffffff' />
    </Head>
  );
}

// !STARTERCONF this is the default favicon, you can generate your own from https://realfavicongenerator.net/
// ! then replace the whole /public/favicon folder and favicon.ico
const favicons: Array<React.ComponentPropsWithoutRef<'link'>> = [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: withVersion('/favicon/apple-touch-icon.png'),
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: withVersion('/favicon/favicon-32x32.png'),
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: withVersion('/favicon/favicon-16x16.png'),
  },
  { rel: 'manifest', href: withVersion('/favicon/site.webmanifest') },
  {
    rel: 'mask-icon',
    href: withVersion('/favicon/safari-pinned-tab.svg'),
    color: '#00e887',
  },
  { rel: 'icon', href: withVersion('/favicon/favicon.ico') },
  { rel: 'shortcut icon', href: withVersion('/favicon/favicon.ico') },
];
