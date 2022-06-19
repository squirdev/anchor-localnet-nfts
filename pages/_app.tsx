import React from "react"
import Head from "next/head"
import { ThemeProvider } from "theme-ui"
import Router, { AppProps } from "next/dist/shared/lib/router/router"

// @ts-ignore
import withGA from "next-ga"

import defaultTheme from "../styles/theme"

function App(props: AppProps) {
  const { Component, pageProps } = props

  return (
    <ThemeProvider theme={defaultTheme}>
      <Head>
        {/** Load font styles directly on the document to prevent flashes */}
        <link href="/fonts/fonts.css" rel="stylesheet" />
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default withGA("UA-210303881-1", Router)(App)
