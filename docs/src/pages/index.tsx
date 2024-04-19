import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import { Card } from '@site/src/components/card';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <Link
          className={clsx(styles.action, 'button button--lg')}
          to="/docs/learn/introduction/getting-started"
        >
          Getting started
        </Link>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />

      <main className={styles.cards}>
        <Card
          icon="☄️"
          title="Effector-based"
          description="Experience the power of effector"
        />

        <Card
          icon="🛡️"
          title="Type safe"
          description="TypeScript support out of the box"
        />

        <Card
          icon="💪🏻"
          title="Flexible"
          description="Use fields api outside of form"
        />

        <Card
          icon="🗄️️"
          title="SSR compatible"
          description="Prepare forms state on server"
        />
      </main>
    </Layout>
  );
}
