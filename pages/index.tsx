import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>NeuroSwarm</title>
        <meta name="description" content="Decentralized AI platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to NeuroSwarm</h1>
        <p>A decentralized AI platform where personal agents learn locally and contribute globally.</p>
      </main>
    </div>
  )
}

export default Home