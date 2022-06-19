/** @jsxImportSource theme-ui */

import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js"
import {
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Text,
} from "@theme-ui/components"
import type { NextPage } from "next"
import Head from "next/head"
import { FormEvent, useRef, useState } from "react"

import { getNFTsByOwner, NFT } from "../utils/nfts"

const Home: NextPage = () => {
  const [NFTs, setNFTs] = useState<NFT[] | null>(null)
  const [feedbackStatus, setFeedbackStatus] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const codeRef = useRef<HTMLDivElement>(null)

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const formData = new FormData(e.currentTarget)

      const inputValue = formData.get("address")
      const selectValue = formData.get("network")

      if (!inputValue || !selectValue) {
        throw new Error("Invalid inputs.")
      }

      const addr = new PublicKey(inputValue)

      const connection = new Connection(
        clusterApiUrl(selectValue === "devnet" ? "devnet" : "mainnet-beta")
      )

      setFeedbackStatus("Fetching...")
      const fetchedNFTs = await getNFTsByOwner(addr, connection)
      setNFTs(fetchedNFTs)

      setFeedbackStatus("")
    } catch (e) {
      setFeedbackStatus("Something went wrong. " + e)
    }
  }

  return (
    <div>
      <Head>
        <title>Localnet NFT Cloner</title>
        <meta
          name="description"
          content="Clone NFTs from devnet/mainnet to localnet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        sx={{
          margin: "0 auto",
          maxWidth: "64rem",
          alignSelf: "stretch",
          textAlign: "center",
          padding: "0 1.6rem",
          paddingTop: "8rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Heading
          sx={{
            marginBottom: ".8rem",
          }}
        >
          Anchor config for NFTs on localnet
        </Heading>

        <Text
          sx={{
            margin: "0 4.8rem",
          }}
        >
          Paste your address below and get all Anchor.toml config necessary to
          use your NFTs on Localnet!
        </Text>
        <form
          sx={{
            gap: "1.6rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "3.2rem 0",
          }}
          onSubmit={handleFormSubmit}
        >
          <label
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            Wallet address:
            <Input
              sx={{
                minWidth: "24rem",
                ":-webkit-autofill": {
                  boxShadow: "none!important",
                },
              }}
              ref={inputRef}
              name="address"
              placeholder="Paste your wallet address here"
            />
          </label>
          <label
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            Clone Accounts from:
            <Select
              sx={{
                minWidth: "24rem",
              }}
              name="network"
              ref={selectRef}
              defaultValue="devnet"
            >
              <option value="mainnet-beta">Mainnet</option>
              <option value="devnet">Devnet</option>
            </Select>
          </label>
          <Button type="submit">Fetch accounts!</Button>
          {feedbackStatus}&nbsp;
        </form>
        {NFTs ? (
          <>
            <Flex
              sx={{
                margin: "1.6rem 0",
                borderTop: "1px solid",
                borderColor: "text",
                paddingTop: "1.6rem",
              }}
            >
              <Flex
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Heading variant="heading2">Your config</Heading>
                <Text>
                  Copy the code below and paste it at the end of your
                  Anchor.toml file!
                </Text>
              </Flex>
              <Button
                sx={{
                  alignSelf: "flex-end",
                  justifySelf: "flex-end",
                  marginLeft: "auto",
                }}
                variant="secondary"
                onClick={() => {
                  if (codeRef.current) {
                    navigator.clipboard.writeText(codeRef.current?.innerText)
                  }
                }}
              >
                copy
              </Button>
            </Flex>
            <div
              sx={{
                backgroundColor: "background2",
                padding: "1.6rem 3.2rem",
                textAlign: "left",
              }}
              ref={codeRef}
              lang="toml"
            >
              ### Generated by anchor-localnet-nfts
              <br />
              <br />
              ## Necessary for test validator <br />
              [test.validator]
              <br />
              url = &quot;https://api.{selectRef.current?.value}
              .solana.com&quot;
              <br />
              [test]
              <br />
              startup_wait = 20000
              <br />
              <br />
              ## Cloning main programs
              <br />
              # Token program
              <br />
              [[test.validator.clone]]
              <br />
              address = &quot;TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA&quot;
              <br />
              # Associated Token program
              <br />
              [[test.validator.clone]]
              <br />
              address = &quot;ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL&quot;
              <br />
              # Token Metadata program
              <br />
              [[test.validator.clone]]
              <br />
              address = &quot;metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s&quot;
              <br />
              <br />
              ### Cloning NFT-related Accounts from address{" "}
              {inputRef.current?.value.slice(0, 5)}... on{" "}
              {selectRef.current?.value}
              <br />
              {NFTs &&
                NFTs.map((nft, index) => {
                  return (
                    <>
                      <br />
                      ## NFT #{index} ({nft.onchainMetadata.data.name})
                      <br />
                      # Mint address <br /> [[test.validator.clone]]
                      <br />
                      address = &quot;{nft.mint.toString()}&quot;
                      <br /># Associated Token Account address
                      <br />
                      [[test.validator.clone]]
                      <br />
                      address = &quot;{nft.pubkey?.toString()}&quot;
                      <br /># Metadata Program Derived address
                      <br />
                      [[test.validator.clone]]
                      <br />
                      address = &quot;{nft.metadataPDA.toString()}&quot;
                      <br />
                      <br />
                    </>
                  )
                })}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}

export default Home
