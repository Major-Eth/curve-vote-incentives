# Gauge Vote Incentivisation

**_/!\ This repo was forked and updated to fix layout issues and improve some loading elements. Crash may occurs and issues may be found. Please report them here so we can fix them /!\_**

A screen with a URL param to specify the reward_token
Then we just iterate through all the gauges and display if there is any claimable tokens
And an add reward option, where you just give a token address, and choose a gauge and amount

## How are the gauges fetched
All gauges are fetched through their rewards on the [Bribery](https://etherscan.io/address/0x7893bbb46613d7a4fbcc31dab4c9b823ffee1026#readContract) contract. They are then added to the `/utils/defaultsTokens.json` file. If a new reward token is added, this list must be updated to correctly display the info.
